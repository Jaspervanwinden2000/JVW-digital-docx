import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY niet geconfigureerd' }, { status: 500 });
  }
  try {
    const { tekst } = await req.json();
    if (!tekst?.trim()) return NextResponse.json({ regels: [] });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Je bent een Nederlandse factuurassistent. Zet een werkbeschrijving om naar factuurregels.
Geef uitsluitend JSON terug met dit formaat:
{
  "regels": [
    {
      "omschrijving": "Duidelijke Nederlandse omschrijving",
      "aantal": 1,
      "eenheid": "uur",
      "prijsPerEenheid": 75,
      "btwTarief": 21
    }
  ]
}
Regels:
- eenheid: gebruik "uur" voor tijdswerk, "stuk" voor producten, "project" voor vaste prijs, "maand" voor abonnementen, "dag" voor dagtarieven
- btwTarief: 21% voor diensten/producten, 9% voor voedsel/boeken, 0% voor vrijgesteld
- Als er geen prijs is opgegeven, gebruik een realistische marktprijs voor Nederland
- Splits combinaties op in aparte regels als dat logisch is`,
        },
        { role: 'user', content: tekst },
      ],
      temperature: 0.1,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content || '{"regels":[]}';
    const parsed = JSON.parse(content);
    return NextResponse.json({ regels: parsed.regels || [] });
  } catch {
    return NextResponse.json({ error: 'Verwerking mislukt' }, { status: 500 });
  }
}
