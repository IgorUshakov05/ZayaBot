import { Scenes } from "telegraf";

// Здесь мы описываем, какие данные сохраняем между шагами Wizard
export interface RegistrationWizardState {
  title?: string;
  domain?: string;
}

// Расширяем стандартный контекст сцены
export interface MyWizardContext extends Scenes.WizardContext {
  wizard: Scenes.WizardContextWizard<MyWizardContext> & {
    state: RegistrationWizardState;
  };
}
