import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';

// Load environment variables
dotenv.config();

<<<<<<< HEAD
=======
// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'TELEGRAM_BOT_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

>>>>>>> e212c8d (chore: update Telegram bot token)
// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Store current post data
let currentPost = {
  title: '',
  description: '',
  image_url: ''
};

// Log startup
console.log('Bot started successfully!');

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Command handlers
bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Привет! Я бот для публикации новостей. Используйте /newpost для создания новой новости.');
  } catch (error) {
    console.error('Error in /start command:', error);
  }
});

bot.onText(/\/newpost/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    currentPost = {
      title: '',
      description: '',
      image_url: ''
    };
    await bot.sendMessage(chatId, 'Введите заголовок новости:');
    
    bot.once('message', async (msg) => {
      try {
        currentPost.title = msg.text;
        await bot.sendMessage(chatId, 'Введите описание новости:');
        
        bot.once('message', async (msg) => {
          try {
            currentPost.description = msg.text;
            await bot.sendMessage(chatId, 'Отправьте изображение для новости (или отправьте /skip для пропуска):');
            
            bot.once('message', async (msg) => {
              try {
                if (msg.photo) {
                  const fileId = msg.photo[msg.photo.length - 1].file_id;
                  const file = await bot.getFile(fileId);
                  const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
                  
                  // Download and process image
                  const response = await fetch(fileUrl);
                  const buffer = await response.arrayBuffer();
                  const processedImage = await sharp(buffer)
                    .resize(800, 600, { fit: 'inside' })
                    .toBuffer();
                  
                  // Upload to Supabase Storage
                  const { data, error } = await supabase.storage
                    .from('news-images')
                    .upload(`${Date.now()}.jpg`, processedImage, {
                      contentType: 'image/jpeg'
                    });
                  
                  if (error) {
                    console.error('Error uploading image:', error);
                    await bot.sendMessage(chatId, 'Ошибка при загрузке изображения. Продолжаем без него.');
                  } else {
                    currentPost.image_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/news-images/${data.path}`;
                  }
                }
                
                // Publish news
                const { data, error } = await supabase
                  .from('news')
                  .insert([currentPost])
                  .select();
                
                if (error) {
                  console.error('Error publishing news:', error);
                  await bot.sendMessage(chatId, 'Ошибка при публикации новости.');
                } else {
                  await bot.sendMessage(chatId, 'Новость успешно опубликована!');
                }
              } catch (error) {
                console.error('Error in image handling:', error);
                await bot.sendMessage(chatId, 'Произошла ошибка при обработке изображения.');
              }
            });
          } catch (error) {
            console.error('Error in description handling:', error);
            await bot.sendMessage(chatId, 'Произошла ошибка при обработке описания.');
          }
        });
      } catch (error) {
        console.error('Error in title handling:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при обработке заголовка.');
      }
    });
  } catch (error) {
    console.error('Error in /newpost command:', error);
  }
});

bot.onText(/\/skip/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 'Пропускаем добавление изображения.');
  } catch (error) {
    console.error('Error in /skip command:', error);
  }
}); 