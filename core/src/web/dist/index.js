// Создаём FormData вручную
const formData = new FormData();
formData.append("name", "Иван Иванов");
formData.append("user_phone", "+7 (999) 123-45-67");
formData.append("user_post", "ivan@example.com");
formData.append("user_company", "Моя Компания");
formData.append("user_address", "г. Москва, ул. Ленина, д.1");
formData.append("message", "Это тестовое сообщение");

const fileInput = document.querySelector('input[type="file"]');
if (fileInput && fileInput.files[0]) {
  formData.append("file", fileInput.files[0]);
}

const startResponse = async () => {
  try {
    const response = await fetch(
      `http://localhost:4001/api/v1/request?domain=vk.com`,
      {
        headers: {
          'x-api-key': '15afa577-f37f-45a2-afbc-7918aaf61285'
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
      alert("Ошибка: " + JSON.stringify(result.errors));
    }
  } catch (err) {
    console.error("Ошибка при отправке формы:", err);
    alert("Ошибка при отправке формы");
  }
};
startResponse();
