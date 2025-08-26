#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>

#define SIZE 4
#define PAIRS 8

char *pairs[PAIRS] = {
    "Asuka", "Rei",
    "Shinji", "Kaworu",
    "Misato", "Eva-01",
    "Eva-02", "Angel"
};

char board[SIZE][SIZE][10];        // Cartas visibles
int revealed[SIZE][SIZE];          // Cartas descubiertas

void shuffleBoard() {
    char temp[PAIRS * 2][10];
    for (int i = 0; i < PAIRS; i++) {
        strcpy(temp[2 * i], pairs[i]);
        strcpy(temp[2 * i + 1], pairs[i]);
    }

    // Shuffle
    for (int i = 0; i < PAIRS * 2; i++) {
        int j = rand() % (PAIRS * 2);
        char t[10];
        strcpy(t, temp[i]);
        strcpy(temp[i], temp[j]);
        strcpy(temp[j], t);
    }

    // Poner en tablero
    int idx = 0;
    for (int i = 0; i < SIZE; i++)
        for (int j = 0; j < SIZE; j++)
            strcpy(board[i][j], temp[idx++]);
}

void printBoard(int showAll) {
    printf("\n    0      1      2      3\n");
    printf("  -------------------------\n");
    for (int i = 0; i < SIZE; i++) {
        printf("%d |", i);
        for (int j = 0; j < SIZE; j++) {
            if (revealed[i][j] || showAll)
                printf(" %-6s", board[i][j]);
            else
                printf("  [??] ");
        }
        printf("\n");
    }
    printf("\n");
}

int main() {
    srand(time(NULL));
    shuffleBoard();

    int foundPairs = 0;
    int attempts = 0;

    while (foundPairs < PAIRS) {
        printBoard(0);
        int x1, y1, x2, y2;

        printf("Turno #%d - Elige la primera carta (fila columna): ", attempts + 1);
        scanf("%d %d", &x1, &y1);
        if (revealed[x1][y1]) {
            printf("Ya está revelada. Intenta otra.\n");
            continue;
        }

        printf("Elige la segunda carta (fila columna): ");
        scanf("%d %d", &x2, &y2);
        if (revealed[x2][y2] || (x1 == x2 && y1 == y2)) {
            printf("Inválido. Intenta otra vez.\n");
            continue;
        }

        printf("\nHas elegido:\n");
        printf(" - (%d,%d): %s\n", x1, y1, board[x1][y1]);
        printf(" - (%d,%d): %s\n", x2, y2, board[x2][y2]);

        if (strcmp(board[x1][y1], board[x2][y2]) == 0) {
            printf("¡Par encontrado!\n");
            revealed[x1][y1] = 1;
            revealed[x2][y2] = 1;
            foundPairs++;
        } else {
            printf("No coinciden. Intenta nuevamente.\n");
        }

        attempts++;
        printf("Pares encontrados: %d / %d\n", foundPairs, PAIRS);
        printf("----------------------------\n");
    }

    printf("\n🎉 ¡Felicidades! Encontraste todos los pares en %d intentos.\n", attempts);
    printBoard(1);

    return 0;
}
