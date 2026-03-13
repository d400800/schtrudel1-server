export interface ITelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
}

export interface ITelegramChat {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  type: string;
}

export interface ITelegramMessage {
  message_id: number;
  from: ITelegramUser;
  chat: ITelegramChat;
  date: number;
  text: string;
}

export interface ITelegramUpdate {
  update_id: number;
  message?: ITelegramMessage;
}
