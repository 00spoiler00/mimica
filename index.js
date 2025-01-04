import chalk from "chalk";
import inquirer from "inquirer";
import notifier from "node-notifier";

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
        "Introdueix els noms dels jugadors separats per comes (mínim 3):",
      filter: (input) => input.split(",").map((name) => name.trim()),
      validate: (input) =>
        input.split(",").length >= 3
          ? true
          : "Has d'introduir almenys 3 noms de jugadors.",
    },
  ]);

  const players = playerNames; // Ja és un array després del `filter`

  let scores = players.reduce((acc, player) => {
    acc[player] = 0;
    return acc;
  }, {});

  // Generar totes les permutacions de combinacions
  const generateCombinations = (players) => {
    const combinations = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = 0; j < players.length; j++) {
        if (i !== j) {
          const others = players.filter(
            (_, index) => index !== i && index !== j
          );
          combinations.push({
            mimica: players[i],
            endevina: players[j],
            mira: others,
          });
        }
      }
    }
    return combinations;
  };

  const combinations = generateCombinations(players);

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
          )} endevina\n- ${chalk.bold(mira.join(", "))} miren.`
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
