const formData = new FormData();
formData.append("name_input", "Иван Иванов");
formData.append("phone_input", "+7 (999) 123-45-67");
formData.append("post_input", "ivan@example.com");
formData.append("company_input", "Моя Компания");
formData.append("address_input", "г. Москва, ул. Ленина, д.1");
formData.append("message_input", "Это тестовое сообщение");

formData.append("file", fileInput.files[0]);

const startResponse = async () => {
  try {
    const response = await fetch(
      `https://zayabot.huntteam.ru/api/v1/request?domain=your_domain`,
      {
        headers: {
          "x-api-key": "<API-KEY>",
        },
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    console.log("Ответ сервера:", result);

    if (result.success) {
      alert("Заявка успешно отправлена!");
    } else {
      alert("Ошибка: " + JSON.stringify(result.message));
    }
  } catch (err) {
    console.error("Ошибка при отправке формы:", err);
    alert("Ошибка при отправке формы");
  }
};
