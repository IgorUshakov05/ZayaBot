import { Types } from "mongoose";
import { ApplicationData } from "../../types/Application";
import IUser, { Role } from "../../types/UserSchema";
import { Application } from "../schema/ApplicationSchema";
import { Company } from "../schema/CompanySchema";
import { User } from "../schema/UserSchema";
import IApplication, { Status } from "../../types/ApplicationSchema";
import { ICompanySchema } from "../../types/CompanySchema";
import { startOfMonth, endOfMonth } from "date-fns";
import { toTitleCase } from "../../bot/global/toTitleCase";

/**
 * Создаёт новую заявку и связывает её с компанией по api_key.
 *
 * @param param.data - Данные заявки, соответствующие типу ApplicationData
 * @param param.chat_data - Массив объектов с chat_id и message_id для хранения сообщений Telegram
 * @param param.api_key - API-ключ компании, к которой привязывается заявка
 *
 * @returns Объект с результатом выполнения:
 *          - success: true при успешном создании
 *          - success: false и сообщение об ошибке в случае сбоя
 */
export async function create_application({
  data,
  count,
  chat_data,
  api_key,
}: {
  data: ApplicationData;
  count: number;
  chat_data: { message_id: number; chat_id: number; role: Role }[];
  api_key: string;
}): Promise<{ success: true } | { success: false; message: string }> {
  try {
    const company = await Company.findOne({ api_key });

    if (!company) {
      return { success: false, message: "Компания с таким api_key не найдена" };
    }

    const newApplication = new Application({
      ...data,
      chats: chat_data,
      count,
      company: company._id,
    });

    await newApplication.save();

    await company.applications.push(newApplication._id as Types.ObjectId);
    await company.save();
    return { success: true };
  } catch (error) {
    console.error(error, " create_application");
    return { success: false, message: "Ошибка при сохранении заявки" };
  }
}

/**
 * Обрабатывает взятие заявки в работу менеджером
 * @param chat_id - Уникальный идентификатор чата Telegram
 * @param message_id - ID сообщения в чате для идентификации заявки
 *
 * @returns Возвращает результат операции с информативными сообщениями для бота
 *
 * @example
 * // Успешный результат
 * { success: true, chats: [...], user_name: "Игорек" }
 *
 * // Ошибки
 * { success: false, message: "❌ Заявка не найдена!" }
 */
export async function in_work_application({
  chat_id,
  message_id,
}: {
  chat_id: number;
  message_id: number;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      tag: string;
      application: IApplication;
      fullname: string;
    }
> {
  try {
    let application = await Application.findOne({
      "chats.chat_id": chat_id,
      "chats.message_id": message_id,
    });

    if (!application)
      return {
        success: false,
        message:
          "❌ Заявка не найдена!\n\nВозможные причины:\n• Сообщение было удалено\n• Заявка уже обработана\n• Ошибка идентификации\n• Вас удалили из компании",
      };

    if (application.manager) {
      if (application.status === Status.complete) {
        return {
          success: false,
          message:
            "✅ Заявка уже выполнена!\n\nЭта заявка завершена и больше не доступна для работы.",
        };
      }
      return {
        success: false,
        message:
          "🔄 Заявка уже в работе!\nДругой менеджер уже взял эту заявку в обработку.",
      };
    }

    let user = await User.findOne({
      company: application.company,
      chat_id,
    });

    if (!user)
      return {
        success: false,
        message:
          "🚫 Доступ запрещен!\n\nВы не можете ответить на эту заявку.\nВозможно, вы были удалены из компании.",
      };

    if (!user.company.equals(application.company))
      return {
        success: false,
        message:
          "🏢 Заявка не принадлежит вашей компании!\n\nОбратитесь к администратору для уточнения деталей.",
      };

    if (user.role === Role.director)
      return {
        success: false,
        message:
          "👨‍💼 Директор не работает с заявками!\n\nРоль директора не позволяет брать заявки в работу.\nОбратитесь к менеджерам вашей компании.",
      };
    let together_application_user = await Application.findOne({
      manager: user._id,
      status: Status.inWork,
    });

    if (together_application_user) {
      return {
        success: false,
        message: `
⚠️ <b>Невозможно взять новую заявку!</b>

Завершите текущую заявку:<b> #${together_application_user.count}</b>
`,
      };
    }

    application.manager = user._id as Types.ObjectId;
    application.status = Status.inWork;
    await application.save();

    return {
      success: true,
      application,
      tag: user.user_tag,
      fullname: `${user.name} ${!!user.surname ? user.surname : ""}`,
    };
  } catch (error) {
    console.error("🚨 Критическая ошибка в функции inWork:", error);
    return {
      success: false,
      message:
        "🚨 Внутренняя ошибка сервера!\n\nПожалуйста, попробуйте позже или обратитесь в техническую поддержку.",
    };
  }
}

export async function add_comment_application({
  chat_id,
  message_id,
  comment,
}: {
  chat_id: number;
  comment: string;
  message_id: number;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      tag: string;
      application: IApplication;
      fullname: string;
      comment: string;
    }
> {
  try {
    // Проверяем, что комментарий не пустой
    if (!comment || comment.trim().length === 0) {
      return {
        success: false,
        message:
          "📝 Комментарий не может быть пустым!\n\nПожалуйста, введите текст комментария.",
      };
    }
    // Ищем заявку
    let application = await Application.findOne({
      "chats.chat_id": chat_id,
      "chats.message_id": message_id,
    });
    if (!application) {
      return {
        success: false,
        message:
          "❌ Заявка не найдена!\n\nВозможные причины:\n• Сообщение было удалено\n• Заявка уже обработана\n• Ошибка идентификации\n• Вас удалили из компании",
      };
    }

    // Ищем пользователя
    let user = await User.findOne({
      company: application.company,
      chat_id,
    });

    if (!user) {
      return {
        success: false,
        message:
          "🚫 Доступ запрещен!\n\nВы не можете комментировать эту заявку.\nВозможно, вы были удалены из компании.",
      };
    }

    if (!user.company.equals(application.company)) {
      return {
        success: false,
        message:
          "🏢 Заявка не принадлежит вашей компании!\n\nОбратитесь к администратору для уточнения деталей.",
      };
    }

    // Проверяем роль пользователя
    if (user.role === Role.director) {
      return {
        success: false,
        message:
          "👨‍💼 Директор не комментирует заявки!\n\nРоль директора не позволяет добавлять комментарии.\nОбратитесь к менеджерам вашей компании.",
      };
    }

    // Проверяем статус заявки
    if (application.status === Status.complete) {
      return {
        success: false,
        message:
          "✅ Заявка уже выполнена!\n\nНельзя добавлять комментарии к завершенной заявке.",
      };
    }
    if (String(application.manager) !== String(user._id)) {
      return {
        success: false,
        message:
          "🚫 Вы не можете комментировать эту заявку!\n\nТолько менеджер, взявший заявку в работу, может добавлять комментарии.",
      };
    }

    // Добавляем комментарий в массив комментариев (лучше чем перезаписывать поле)
    const newComment = {
      user_id: user._id,
      user_name: `${user.name} ${user.surname || ""}`.trim(),
      user_tag: user.user_tag,
      text: comment.trim(),
      created_at: new Date(),
    };

    // Обновляем заявку - добавляем комментарий в массив
    application.comment = comment;

    await application.save();
    return {
      success: true,
      application,
      tag: user.user_tag,
      fullname: `${user.name} ${user.surname || ""}`.trim(),
      comment: comment.trim(),
    };
  } catch (error) {
    console.error("🚨 Критическая ошибка в функции add_comment:", error);
    return {
      success: false,
      message:
        "🚨 Внутренняя ошибка сервера!\n\nПожалуйста, попробуйте позже или обратитесь в техническую поддержку.",
    };
  }
}

/**
 * Отмена заявки менеджером
 * @param chat_id - ID чата пользователя
 * @param message_id - ID сообщения заявки
 */
export async function cancel_application({
  chat_id,
  message_id,
}: {
  chat_id: number;
  message_id: number;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: string;
      application: IApplication;
      tag: string;
      fullname: string;
    }
> {
  try {
    // 🔍 Находим заявку по chat_id и message_id
    const application = await Application.findOne({
      "chats.chat_id": chat_id,
      "chats.message_id": message_id,
    });

    if (!application) {
      return {
        success: false,
        message: `
❌ <b>Заявка не найдена!</b>

Возможные причины:
• Сообщение было удалено  
• Заявка уже обработана  
• Вас удалили из компании
`,
      };
    }

    // 🔍 Находим пользователя
    const user = await User.findOne({
      company: application.company,
      chat_id,
    });

    if (!user) {
      return {
        success: false,
        message: `
🚫 <b>Доступ запрещён!</b>

Вы не можете отменить эту заявку.  
Возможно, вы больше не связаны с компанией.
`,
      };
    }

    // 🔒 Проверка компании
    if (!user.company.equals(application.company)) {
      return {
        success: false,
        message: `
🏢 <b>Заявка принадлежит другой компании!</b>

Обратитесь к администратору для уточнения.
`,
      };
    }

    // 👔 Проверка роли
    if (user.role === Role.director) {
      return {
        success: false,
        message: `
👨‍💼 <b>Директор не может отменять заявки!</b>

Эта функция доступна только менеджерам компании.
`,
      };
    }

    // 🧾 Проверка статуса
    if (application.status === Status.complete) {
      return {
        success: false,
        message: `
✅ <b>Заявка уже выполнена!</b>

Нельзя отменить завершённую заявку.
`,
      };
    }

    // 🧑‍💼 Проверка, кто менеджер
    if (String(application.manager) !== String(user._id)) {
      return {
        success: false,
        message: `
🚫 <b>Вы не можете отменить эту заявку!</b>

Только менеджер, взявший заявку в работу, может её отменить.
`,
      };
    }

    // 🔧 Отмена заявки
    application.status = Status.pending;
    application.manager = null as any;
    await application.save();

    return {
      success: true,
      application,
      message: `
🔄 <b>Заявка №${application.count} успешно отменена!</b>

Она возвращена в общий список и доступна для других менеджеров.
`,
      tag: user.user_tag,
      fullname: `${user.name} ${user.surname || ""}`.trim(),
    };
  } catch (error) {
    console.error("🚨 Ошибка в cancel_application:", error);
    return {
      success: false,
      message: `
🚨 <b>Внутренняя ошибка сервера!</b>

Пожалуйста, попробуйте позже или обратитесь в техническую поддержку.
`,
    };
  }
}

/**
 * Завершение заявки менеджером
 * @param chat_id - ID чата пользователя
 * @param message_id - ID сообщения заявки
 */
export async function finish_application({
  chat_id,
  message_id,
}: {
  chat_id: number;
  message_id: number;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      message: string;
      application: IApplication;
      tag: string;
      fullname: string;
    }
> {
  try {
    // 🔍 Находим заявку по chat_id и message_id
    const application = await Application.findOne({
      "chats.chat_id": chat_id,
      "chats.message_id": message_id,
    });

    if (!application) {
      return {
        success: false,
        message: `
❌ <b>Заявка не найдена!</b>

Возможные причины:
• Сообщение было удалено  
• Заявка уже обработана  
• Ошибка идентификации
`,
      };
    }

    // 🔍 Находим пользователя
    const user = await User.findOne({
      company: application.company,
      chat_id,
    });

    if (!user) {
      return {
        success: false,
        message: `
🚫 <b>Доступ запрещён!</b>

Вы не можете отменить эту заявку.  
Возможно, вы больше не связаны с компанией.
`,
      };
    }

    // 🔒 Проверка компании
    if (!user.company.equals(application.company)) {
      return {
        success: false,
        message: `
🏢 <b>Заявка принадлежит другой компании!</b>

Обратитесь к администратору для уточнения.
`,
      };
    }

    // 👔 Проверка роли
    if (user.role === Role.director) {
      return {
        success: false,
        message: `
👨‍💼 <b>Директор не может отменять заявки!</b>

Эта функция доступна только менеджерам компании.
`,
      };
    }

    // 🧾 Проверка статуса
    if (application.status === Status.complete) {
      return {
        success: false,
        message: `
✅ <b>Заявка уже выполнена!</b>

Нельзя завершить завершённую заявку.
`,
      };
    }

    // 🧑‍💼 Проверка, кто менеджер
    if (String(application.manager) !== String(user._id)) {
      return {
        success: false,
        message: `
🚫 <b>Вы не можете завершить эту заявку!</b>

Только менеджер, взявший заявку в работу, может её завершить.
`,
      };
    }

    // 🔧 Отмена заявки
    application.status = Status.complete;
    await application.save();

    return {
      success: true,
      application,
      message: `
✅ <b>Заявка №${application.count} успешно выполнена!</b>`,
      tag: user.user_tag,
      fullname: `${user.name} ${user.surname || ""}`.trim(),
    };
  } catch (error) {
    console.error("🚨 Ошибка в finish_application:", error);
    return {
      success: false,
      message: `
🚨 <b>Внутренняя ошибка сервера!</b>

Пожалуйста, попробуйте позже или обратитесь в техническую поддержку.
`,
    };
  }
}

export async function get_status_application({
  chat_id,
}: {
  chat_id: number;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      status: {
        [Status.pending]: number;
        [Status.inWork]: number;
        [Status.complete]: number;
      };
    }
> {
  try {
    const user = await User.findOne({
      chat_id,
      role: Role.director,
    })
      .select("company")
      .populate<{
        company: {
          applications: IApplication[];
        } & ICompanySchema;
      }>({
        path: "company",
        populate: {
          path: "applications",
          select: "status",
        },
      })
      .lean();

    if (!user) {
      return { success: false, message: "❌ Вас нет в системе!" };
    }

    if (!user.company) {
      return { success: false, message: "❌ У вас нет компании!" };
    }

    const applications = user.company.applications ?? [];

    if (applications.length === 0) {
      return {
        success: false,
        message: "⏳ Пока новых заявок нет. Ждём клиентов!",
      };
    }
    let status = applications.reduce(
      (acc: any, app) => {
        const key = app.status;
        if (!key) key: 0;
        acc[key] = acc[key] + 1;
        return acc;
      },
      { [Status.pending]: 0, [Status.inWork]: 0, [Status.complete]: 0 }
    );

    // { success: true, status: { pending: number, inWork: number, complete: number } }
    return {
      success: true,
      status,
    };
  } catch (error) {
    console.error("Ошибка в get_all_application:", error);
    return { success: false, message: "Произошла ошибка. Попробуйте позже." };
  }
}

export async function get_all_application({
  chat_id,
}: {
  chat_id: number;
}): Promise<
  | { success: false; message: string }
  | { success: true; applications: IApplication[] }
> {
  try {
    const user = await User.findOne({
      chat_id,
      role: Role.director,
    })
      .select("company")
      .populate<{
        company: {
          applications: IApplication[];
        } & ICompanySchema;
      }>({
        path: "company",
        populate: {
          path: "applications",
          populate: {
            path: "manager",
          },
        },
      })
      .lean();

    if (!user) {
      return { success: false, message: "❌ Вас нет в системе!" };
    }

    if (!user.company) {
      return { success: false, message: "❌ У вас нет компании!" };
    }

    const applications = user.company.applications ?? [];

    if (applications.length === 0) {
      return {
        success: false,
        message: "⏳ Пока новых заявок нет. Ждём клиентов!",
      };
    }

    return {
      success: true,
      applications,
    };
  } catch (error) {
    console.error("Ошибка в get_all_application:", error);
    return { success: false, message: "Произошла ошибка. Попробуйте позже." };
  }
}

export async function get_all_application_and_month_rating({
  chat_id,
}: {
  chat_id: number;
}): Promise<
  | { success: false; message: string }
  | {
      success: true;
      monthCountApplication: number;
      rating: {
        name: string;
        user_tag: string | null;
        count: number;
      }[];
    }
> {
  try {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const user = await User.findOne({
      chat_id,
      role: Role.director,
    })
      .select("company")
      .populate<{
        company: ICompanySchema & {
          applications: (IApplication & {
            manager: { name: string; surname: string; user_tag: string } | null;
          })[];
        };
      }>({
        path: "company",
        populate: {
          path: "applications",
          match: {
            status: Status.complete,
            updatedAt: { $gte: monthStart, $lt: monthEnd },
          },
          populate: {
            path: "manager",
            select: "name surname user_tag",
          },
        },
      })
      .lean();

    if (!user) {
      return { success: false, message: "Вас нет в системе!" };
    }

    if (!user.company) {
      return { success: false, message: "У вас нет компании!" };
    }

    const allCountApplication = await Application.countDocuments({
      company: user.company._id,
      updatedAt: { $gte: monthStart, $lt: monthEnd },
    });

    const monthApplications = user.company.applications ?? [];

    if (monthApplications.length === 0) {
      return {
        success: true,
        monthCountApplication: 0,
        rating: [],
      };
    }

    const groupedByManager = monthApplications.reduce((acc, app: any) => {
      const key = app.manager?._id?.toString() ?? "no-manager";
      if (!acc[key]) acc[key] = [];
      acc[key].push(app);
      return acc;
    }, {} as Record<string, typeof monthApplications>);

    const rating = Object.entries(groupedByManager)
      .map(([managerId, apps]: any[]) => {
        const manager = apps[0].manager;
        return {
          name: manager
            ? `${toTitleCase(manager.name)} ${toTitleCase(manager.surname)}`
            : "Без менеджера (удаленного)",
          user_tag: manager?.user_tag ? `@${manager.user_tag}` : null,
          count: apps.length,
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      monthCountApplication: allCountApplication,
      rating,
    };
  } catch (error) {
    console.error("Ошибка в get_all_application_and_month_rating:", error);
    return { success: false, message: "Произошла ошибка. Попробуйте позже." };
  }
}
