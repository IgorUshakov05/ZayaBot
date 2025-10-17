// Создаём FormData вручную
const formData = new FormData();
formData.append("name", "Иван Иванов");
formData.append("phone", "+7 (999) 123-45-67");
formData.append("post", "ivan@example.com");
formData.append("company", "Моя Компания");
formData.append("address", "г. Москва, ул. Ленина, д.1");
formData.append("message", "Это тестовое сообщение");

const fileInput = document.querySelector('input[type="file"]');
if (fileInput && fileInput.files[0]) {
  formData.append("file", fileInput.files[0]);
}

const startResponse = async () => {
  try {
    const response = await fetch(
      `http://localhost:4001/api/v1/request?domain=localhost:3000`,
      {
        headers: {
          'x-api-key': '5c705969-5c3a-4f6e-be47-8df800bff492'
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
