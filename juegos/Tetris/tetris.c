// TETRIS EN C MULTIPLATAFORMA - PIEZAS CLÁSICAS
// Controles: 'a' = izquierda, 'd' = derecha, 's' = bajar, 'w' = rotar
// Este código usa Windows o POSIX según plataforma (usando #ifdef)
// Dibujado en consola usando caracteres ASCII
// ERROR: FALTA PANTALLA DE GAME OVER
// Creado por: Marco Valentin Martinez Matia

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#ifdef _WIN32
#include <windows.h>
#include <conio.h>
#else
#include <unistd.h>
#include <termios.h>
#include <fcntl.h>
#endif

#define ROWS 20           // Alto del tablero
#define COLS 10           // Ancho del tablero
#define NUM_PIECES 7      // Total de tipos de piezas

int board[ROWS][COLS] = {0};
int score = 0;
int totalLinesCleared = 0;

// Piezas Tetris: I, O, T, S, Z, J, L
int pieces[NUM_PIECES][4][4][4] = {
    // I
    {{{0,0,0,0},{1,1,1,1},{0,0,0,0},{0,0,0,0}},
    {{0,0,1,0},{0,0,1,0},{0,0,1,0},{0,0,1,0}},
    {{0,0,0,0},{1,1,1,1},{0,0,0,0},{0,0,0,0}},
    {{0,0,1,0},{0,0,1,0},{0,0,1,0},{0,0,1,0}}},
    // O
    {{{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}},
    {{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}},
    {{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}},
    {{0,0,0,0},{0,1,1,0},{0,1,1,0},{0,0,0,0}}},
    // T
    {{{0,0,0,0},{1,1,1,0},{0,1,0,0},{0,0,0,0}},
    {{0,1,0,0},{1,1,0,0},{0,1,0,0},{0,0,0,0}},
    {{0,1,0,0},{1,1,1,0},{0,0,0,0},{0,0,0,0}},
    {{0,1,0,0},{0,1,1,0},{0,1,0,0},{0,0,0,0}}},
    // S
    {{{0,0,0,0},{0,1,1,0},{1,1,0,0},{0,0,0,0}},
    {{1,0,0,0},{1,1,0,0},{0,1,0,0},{0,0,0,0}},
    {{0,0,0,0},{0,1,1,0},{1,1,0,0},{0,0,0,0}},
    {{1,0,0,0},{1,1,0,0},{0,1,0,0},{0,0,0,0}}},
    // Z
    {{{0,0,0,0},{1,1,0,0},{0,1,1,0},{0,0,0,0}},
    {{0,1,0,0},{1,1,0,0},{1,0,0,0},{0,0,0,0}},
    {{0,0,0,0},{1,1,0,0},{0,1,1,0},{0,0,0,0}},
    {{0,1,0,0},{1,1,0,0},{1,0,0,0},{0,0,0,0}}},
    // J
    {{{1,0,0,0},{1,1,1,0},{0,0,0,0},{0,0,0,0}},
    {{0,1,1,0},{0,1,0,0},{0,1,0,0},{0,0,0,0}},
    {{0,0,0,0},{1,1,1,0},{0,0,1,0},{0,0,0,0}},
    {{0,1,0,0},{0,1,0,0},{1,1,0,0},{0,0,0,0}}},
    // L
    {{{0,0,1,0},{1,1,1,0},{0,0,0,0},{0,0,0,0}},
    {{0,1,0,0},{0,1,0,0},{0,1,1,0},{0,0,0,0}},
    {{0,0,0,0},{1,1,1,0},{1,0,0,0},{0,0,0,0}},
    {{1,1,0,0},{0,1,0,0},{0,1,0,0},{0,0,0,0}}}
};

typedef struct {
    int x, y;          // Posición en el tablero
    int rotation;      // Rotación actual (0-3)
    int type;          // Tipo de pieza (0-6)
} Piece;

Piece current;

// LIMPIAR PANTALLA (DEPENDIENTE DEL SISTEMA)
#ifdef _WIN32
void clearScreen() {
    COORD coord = {0, 0};
    SetConsoleCursorPosition(GetStdHandle(STD_OUTPUT_HANDLE), coord);
}
#else
// POSIX: ANSI escape para limpiar pantalla
void clearScreen() {
    printf("\033[H");
}
// Emulación de _kbhit y _getch para Unix
int _kbhit(void) {
    struct termios oldt, newt;
    int ch;
    int oldf;
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);
    oldf = fcntl(STDIN_FILENO, F_GETFL, 0);
    fcntl(STDIN_FILENO, F_SETFL, oldf | O_NONBLOCK);
    ch = getchar();
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    fcntl(STDIN_FILENO, F_SETFL, oldf);
    if (ch != EOF) {
        ungetc(ch, stdin);
        return 1;
    }
    return 0;
}
int _getch(void) {
    struct termios oldt, newt;
    int ch;
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);
    ch = getchar();
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    return ch;
}
#endif

// DIBUJAR EL TABLERO CON LA PIEZA ACTUAL
void drawBoard() {
    clearScreen();
    for (int y = 0; y < ROWS; y++) {
        for (int x = 0; x < COLS; x++) {
            int draw = board[y][x];
            // Dibujar la pieza activa encima del tablero
            for (int py = 0; py < 4; py++) {
                for (int px = 0; px < 4; px++) {
                    int val = pieces[current.type][current.rotation][py][px];
                    if (val && current.x + px == x && current.y + py == y)
                        draw = 1;
                }
            }
            printf(draw ? "[]" : " .");
        }
        printf("\n");
    }
    printf("\nPuntaje: %d\n", score);
    printf("L\x1Aneas eliminadas: %d\n", totalLinesCleared);
}

// DETECTAR COLISIONES AL MOVER O ROTAR
int checkCollision(int nx, int ny, int rot) {
    for (int py = 0; py < 4; py++) {
        for (int px = 0; px < 4; px++) {
            int val = pieces[current.type][rot][py][px];
            if (val) {
                int bx = nx + px;
                int by = ny + py;
                if (bx < 0 || bx >= COLS || by >= ROWS) return 1;
                if (by >= 0 && board[by][bx]) return 1;
            }
        }
    }
    return 0;
}

// FIJAR PIEZA EN EL TABLERO CUANDO LLEGA AL FONDO
void fixPiece() {
    for (int py = 0; py < 4; py++) {
        for (int px = 0; px < 4; px++) {
            int val = pieces[current.type][current.rotation][py][px];
            if (val) {
                int bx = current.x + px;
                int by = current.y + py;
                if (by >= 0) board[by][bx] = 1;
            }
        }
    }
}

// ELIMINAR LÍNEAS COMPLETAS Y SUMAR PUNTOS
void clearFullLines() {
    int linesCleared = 0;
    for (int y = 0; y < ROWS; y++) {
        int full = 1;
        for (int x = 0; x < COLS; x++) {
            if (!board[y][x]) {
                full = 0;
                break;
            }
        }
        if (full) {
            linesCleared++;
            for (int i = y; i > 0; i--)
                for (int x = 0; x < COLS; x++)
                    board[i][x] = board[i - 1][x];
            for (int x = 0; x < COLS; x++)
                board[0][x] = 0;
            y--;
        }
    }
    totalLinesCleared += linesCleared;
    switch (linesCleared) {
        case 1: score += 100; break;
        case 2: score += 300; break;
        case 3: score += 500; break;
        case 4: score += 800; break;
    }
}

// PUNTUACIÓN FINAL
void gameOver() {
    drawBoard();
    printf("\n=== GAME OVER ===\n");
    printf("Puntuación final: %d\n", score);
    printf("Líneas eliminadas: %d\n", totalLinesCleared);
    printf("\nGracias por jugar.\n");
    exit(0);
}

// CREAR NUEVA PIEZA ALEATORIA
void newPiece() {
    current.x = 3;
    current.y = 0;
    current.rotation = 0;
    current.type = rand() % NUM_PIECES;
    if (checkCollision(current.x, current.y, current.rotation)) {
        gameOver();
    }
}

void gameOver() {
    drawBoard();                        // Mostrar el tablero final
    fflush(stdout);
#ifdef _WIN32
    Sleep(500);
#else
    usleep(500000);
#endif
    printf("\n=== GAME OVER ===\n");
    printf("Puntuación final: %d\n", score);
    printf("Líneas eliminadas: %d\n", totalLinesCleared);
    printf("\nGracias por jugar.\n");
    printf("Presiona cualquier tecla para salir...\n");
    fflush(stdout);
    _getch();
    exit(0);
}

// MOVER PIEZA HACIA ABAJO, FIJAR SI COLISIONA
void moveDown() {
    if (!checkCollision(current.x, current.y + 1, current.rotation)) {
        current.y++;
    } else {
        fixPiece();
        clearFullLines();
        newPiece();
    }
}

// ROTAR PIEZA EN EL SENTIDO DE LAS AGUJAS DEL RELOJ
void rotate() {
    int nextRot = (current.rotation + 1) % 4;
    if (!checkCollision(current.x, current.y, nextRot)) {
        current.rotation = nextRot;
    }
}

// LEER TECLADO Y APLICAR MOVIMIENTOS
void handleInput() {
    if (_kbhit()) {
        char c = _getch();
        if (c == 'a' && !checkCollision(current.x - 1, current.y, current.rotation)) current.x--;
        else if (c == 'd' && !checkCollision(current.x + 1, current.y, current.rotation)) current.x++;
        else if (c == 's') moveDown();
        else if (c == 'w') rotate();
    }
}

// PROGRAMA PRINCIPAL
int main() {
    srand(time(NULL));
    newPiece();
    unsigned long lastTick = clock();
    while (1) {
        handleInput();
        unsigned long now = clock();
        if ((now - lastTick) > CLOCKS_PER_SEC / 2) {
            moveDown();
            lastTick = now;
        }
        drawBoard();
#ifdef _WIN32
        Sleep(50);
#else
        usleep(50000);
#endif
    }
    return 0;
}