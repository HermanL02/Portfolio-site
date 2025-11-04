import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Load all YAML configuration files
function loadYamlConfigs() {
  const configDir = path.join(process.cwd(), 'config');
  const yamlFiles = [
    'intro.yaml',
    'current_work.yaml',
    'learning.yaml',
    'experience.yaml',
    'education.yaml',
    'tech_stack.yaml',
    'fun_facts.yaml',
    'journey.yaml'
  ];

  const configs: Record<string, unknown> = {};

  yamlFiles.forEach(file => {
    const filePath = path.join(configDir, file);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(fileContent);
      const key = file.replace('.yaml', '');
      configs[key] = data;
    }
  });

  return configs;
}

// Create system prompt with all profile information
function createSystemPrompt(configs: Record<string, unknown>) {
  const introConfig = configs.intro as { contact?: { email?: string } } | undefined;
  const email = introConfig?.contact?.email || 'Hermanyiqunliang@gmail.com';

  return `You are a helpful AI assistant representing Herman Liang's professional portfolio website.
Your role is to answer questions about Herman's background, experience, skills, and projects.

Here is Herman's complete profile information:

${JSON.stringify(configs, null, 2)}

Guidelines:
- Be friendly, professional, and helpful
- Answer questions based on the profile information provided
- If asked about something not in the profile, politely say you don't have that information
- Keep responses concise and relevant
- You can elaborate on experiences, education, or projects when asked
- If recruiters ask about availability or contact, refer them to the email: ${email}`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Load all YAML configs
    const configs = loadYamlConfigs();
    const systemPrompt = createSystemPrompt(configs);

    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from ChatGPT' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      message: assistantMessage,
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
