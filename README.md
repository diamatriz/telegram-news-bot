# Telegram News Bot

Бот для публикации новостей на сайте через Telegram. Интегрируется с Supabase для хранения данных и изображений.

## Функциональность

- Создание новостей через команды в Telegram
- Загрузка и обработка изображений
- Хранение данных в Supabase
- Автоматическое развертывание на Render.com

## Команды

- `/start` - Начало работы с ботом
- `/newpost` - Создание новой новости
- `/skip` - Пропуск загрузки изображения

## Технологии

- Node.js
- Telegram Bot API
- Supabase
- Sharp (для обработки изображений)
- Render.com (для хостинга)

## Установка

1. Клонировать репозиторий:
   ```bash
   git clone https://github.com/yourusername/telegram-news-bot.git
   cd telegram-news-bot
   ```

2. Установить зависимости:
   ```bash
   npm install
   ```

3. Создать файл `.env` с переменными окружения:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

## Развертывание на Render.com

1. Создать аккаунт на [Render.com](https://render.com)
2. Подключить GitHub репозиторий
3. Создать новый Web Service
4. Настроить переменные окружения
5. Запустить деплой

## Переменные окружения

- `SUPABASE_URL` - URL вашего проекта Supabase
- `SUPABASE_KEY` - API ключ Supabase
- `TELEGRAM_BOT_TOKEN` - Токен вашего Telegram бота

## Лицензия

MIT 