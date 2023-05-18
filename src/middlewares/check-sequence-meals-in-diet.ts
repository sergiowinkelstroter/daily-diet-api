import { Meals } from "../@types/meals";

export function checkSequenceMealsInDiet(refeicoes: Meals[]): number {
  let maiorSequencia = 0;
  let sequenciaAtual = 0;

  for (const refeicao of refeicoes) {
    if (refeicao.inside_diet) {
      sequenciaAtual++;
      if (sequenciaAtual > maiorSequencia) {
        maiorSequencia = sequenciaAtual;
      }
    } else {
      sequenciaAtual = 0;
    }
  }

  return maiorSequencia;
}
