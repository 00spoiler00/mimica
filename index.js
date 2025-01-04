import chalk from "chalk";
import inquirer from "inquirer";
import notifier from "node-notifier";

const defaultPlayers = ["Mila", "Anna", "Marc"];

async function main() {
  console.log(chalk.blueBright.bold("🎭 Benvingut al joc de mímica! 🎭\n"));

  // Demana el temps per torn
  const { turnTime } = await inquirer.prompt([
    {
      type: "number",
      name: "turnTime",
      message: "Quants segons vols per cada torn?",
      default: 30,
      validate: (input) =>
        input > 0 ? true : "El temps ha de ser un número positiu.",
    },
  ]);

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
    for (const { mimica, endevina, mira } of combinations) {
      // Neteja la pantalla i mostra la informació del torn
      console.clear();
      console.log(chalk.yellowBright(`🔄 Ronda ${rounds} 🔄`));
      console.log(chalk.greenBright(`🎬 Torn actual:`));
      console.log(
        chalk.green(
          `- ${chalk.bold(mimica)} fa mímica\n- ${chalk.bold(
            endevina
          )} endevina\n- ${chalk.bold(mira)} mira.`
        )
      );

      console.log(chalk.blue("\n🏆 Puntuacions actuals:"));
      console.table(scores);

      // Pregunta inicial
      const { ready } = await inquirer.prompt([
        {
          type: "confirm",
          name: "ready",
          message: `Esteu preparats per començar el torn?`,
          default: true,
        },
      ]);

      if (!ready) {
        console.log(chalk.red("⏸️ Torn pausat. Esperant confirmació."));
        continue; // Salta aquest torn si no estan preparats
      }

      console.log(
        chalk.yellow(
          `⏳ Tens ${turnTime} segons per aquest torn. Estigueu atents al final del temps!`
        )
      );

      // Comença el cronòmetre
      const timer = setTimeout(() => {
        notifier.notify({
          title: "⏰ Temps esgotat!",
          message: `El torn de ${mimica} ha acabat.`,
          sound: true, // Activa el so
        });
        console.log(chalk.redBright("⏰ Temps esgotat!"));
      }, turnTime * 1000);

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

      // Atura el cronòmetre si acaba abans del temps
      clearTimeout(timer);

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

  // Mostra el resultat final
  console.clear();
  console.log(chalk.magentaBright.bold("\n🎉 Joc acabat! Resultats finals:"));
  console.table(scores);
}

main();
