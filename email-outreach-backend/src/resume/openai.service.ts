import { OpenAI } from 'openai';
import { Injectable } from '@nestjs/common';
import { CreateUpdateResumeDto } from 'src/resume/dto/create-update-resume.dto';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async enhanceResume(resumeData: CreateUpdateResumeDto): Promise<CreateUpdateResumeDto> {
    const prompt = this.createEnhancementPrompt(resumeData);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-40',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional resume writer. Enhance the provided resume data while maintaining the original structure and fields.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const enhancedContent = response.choices[0]?.message?.content;
      if (!enhancedContent) {
        throw new Error('No content received from OpenAI');
      }

      return JSON.parse(enhancedContent);
    } catch (error) {
      console.error('Error enhancing resume with AI:', error);
      throw new Error('Failed to enhance resume with AI');
    }
  }

  private createEnhancementPrompt(resumeData: CreateUpdateResumeDto): string {
    return `
  You are a professional resume writer.
  
  Enhance the following resume **JSON** while strictly keeping the **same structure** and **keys**. 
  
  ### Instructions:
  - Do not remove or rename any fields.
  - Do not include any explanation or commentary.
  - Only return valid JSON.
  - Improve the language and formatting of each section.
  - Use action verbs and make descriptions achievement-oriented.
  - Optimize the content for ATS (Applicant Tracking Systems).
  - Use skill levels strictly as one of: "beginner", "intermediate", "advanced", "expert".
  
  ### Resume JSON to enhance:
  ${JSON.stringify(resumeData, null, 2)}
  
  ### Important:
  Return **only** the enhanced JSON (valid format) with no extra messages.
  `;
  }
  
}
