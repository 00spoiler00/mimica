import chalk from "chalk";
import inquirer from "inquirer";

const defaultPlayers = ["Mila", "Anna", "Marc"];

async function main() {
  console.log(chalk.blueBright.bold("🎭 Benvingut al joc de mímica! 🎭\n"));

  // Demana els noms dels jugadors
  const { playerNames } = await inquirer.prompt([
    {
      type: "input",
      name: "playerNames",
      message:
        "Introdueix els noms dels jugadors separats per comes (deixa buit per defecte):",
      default: defaultPlayers.join(", "),
      filter: (input) => input.split(",").map((name) => name.trim()),
    },
  ]);

  if (playerNames.length !== 3) {
    console.log(
      chalk.red("⚠️ Cal introduir exactament tres noms de jugadors.")
    );
    return;
  }

  let scores = {
    [playerNames[0]]: 0,
    [playerNames[1]]: 0,
    [playerNames[2]]: 0,
  };
  const combinations = [
    { mimica: playerNames[0], endevina: playerNames[1], mira: playerNames[2] },
    { mimica: playerNames[0], endevina: playerNames[2], mira: playerNames[1] },
    { mimica: playerNames[1], endevina: playerNames[0], mira: playerNames[2] },
    { mimica: playerNames[1], endevina: playerNames[2], mira: playerNames[0] },
    { mimica: playerNames[2], endevina: playerNames[0], mira: playerNames[1] },
    { mimica: playerNames[2], endevina: playerNames[1], mira: playerNames[0] },
  ];

  let rounds = 0;
  let continueGame = true;

  while (continueGame) {
    rounds++;
    console.log(chalk.yellowBright(`\n🔄 Ronda ${rounds} 🔄`));

    for (const { mimica, endevina, mira } of combinations) {
      console.log(
        chalk.greenBright(
          `\n🎬 Torn: ${chalk.bold(mimica)} fa mímica, ${chalk.bold(
            endevina
          )} endevina, ${chalk.bold(mira)} mira.`
        )
      );

      const { success } = await inquirer.prompt([
        {
          type: "confirm",
          name: "success",
          message: `Han encertat ${chalk.bold(mimica)} i ${chalk.bold(
            endevina
          )}?`,
          default: false,
        },
      ]);

      if (success) {
        scores[mimica]++;
        scores[endevina]++;
        console.log(
          chalk.green(
            `🎉 Bravo! ${mimica} i ${endevina} guanyen 1 punt cadascun.`
          )
        );
      } else {
        console.log(
          chalk.red(
            `😞 Llàstima! ${mimica} i ${endevina} no han encertat aquest torn.`
          )
        );
      }

      console.log(
        chalk.blue(`🏆 Puntuacions actuals: `) +
          Object.entries(scores)
            .map(
              ([player, score]) => `${chalk.bold(player)}: ${chalk.cyan(score)}`
            )
            .join(", ")
      );
    }

    const { continueChoice } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueChoice",
        message: "Vols continuar amb una altra ronda?",
        default: true,
      },
    ]);

    continueGame = continueChoice;
  }

  console.log(chalk.magentaBright.bold("\n🎉 Joc acabat! Resultats finals:"));
  console.table(scores);
}

main();
