import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(private config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY') ?? '',
    });
  }

  async generateText(prompt: string): Promise<string | null> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      max_completion_tokens: 256,
    });

    return response.choices[0].message?.content ?? null;
  }

  async generateImage(
    prompt: string,
    orientation: string = 'landscape',
  ): Promise<string | undefined> {
    const result = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: orientation === 'landscape' ? '1792x1024' : '1024x1792',
    });

    const url = result.data && result.data[0].url;

    console.log('URL: ', url);

    return url;
  }
}
