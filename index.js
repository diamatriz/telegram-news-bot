import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

let currentPost = {
  title: '',
  description: '',
  image_url: ''
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Я бот для публикации новостей. Используйте /newpost для создания новой новости.');
});

bot.onText(/\/newpost/, (msg) => {
  const chatId = msg.chat.id;
  currentPost = {
    title: '',
    description: '',
    image_url: ''
  };
  bot.sendMessage(chatId, 'Введите заголовок новости:');
  bot.once('message', (msg) => {
    currentPost.title = msg.text;
    bot.sendMessage(chatId, 'Введите описание новости:');
    bot.once('message', (msg) => {
      currentPost.description = msg.text;
      bot.sendMessage(chatId, 'Отправьте изображение для новости (или отправьте /skip для пропуска):');
      bot.once('message', async (msg) => {
        if (msg.photo) {
          const fileId = msg.photo[msg.photo.length - 1].file_id;
          const file = await bot.getFile(fileId);
          const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
          
          // Загрузка и обработка изображения
          const response = await fetch(fileUrl);
          const buffer = await response.arrayBuffer();
          const processedImage = await sharp(buffer)
            .resize(800, 600, { fit: 'inside' })
            .toBuffer();
          
          // Загрузка в Supabase Storage
          const { data, error } = await supabase.storage
            .from('news-images')
            .upload(`${Date.now()}.jpg`, processedImage, {
              contentType: 'image/jpeg'
            });
          
          if (error) {
            console.error('Error uploading image:', error);
            bot.sendMessage(chatId, 'Ошибка при загрузке изображения. Продолжаем без него.');
          } else {
            currentPost.image_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/news-images/${data.path}`;
          }
        }
        
        // Публикация новости
        const { data, error } = await supabase
          .from('news')
          .insert([currentPost])
          .select();
        
        if (error) {
          console.error('Error publishing news:', error);
          bot.sendMessage(chatId, 'Ошибка при публикации новости.');
        } else {
          bot.sendMessage(chatId, 'Новость успешно опубликована!');
        }
      });
    });
  });
});

bot.onText(/\/skip/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Пропускаем добавление изображения.');
});

console.log('Bot started...'); 