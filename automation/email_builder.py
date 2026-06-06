"""Build Gmail-compatible HTML body from a daily lesson dict."""

from __future__ import annotations

import html


def _esc(text: str) -> str:
    return html.escape(str(text))


def build_email_html(lesson: dict) -> str:
    """Render lesson content as inline HTML suitable for Gmail."""
    meta = lesson["metadata"]
    vocab = lesson["vocabulary"]
    reading = lesson["reading"]
    grammar = lesson["grammar_focus"]
    listening = lesson["listening_speaking"]
    drill = lesson["toefl_skill_drill"]
    quiz = lesson["daily_quiz"]

    parts: list[str] = [
        f"<h1>Day {meta['day']} 英文學習</h1>",
        f"<p><strong>今日主題：</strong>{_esc(meta['theme'])}</p>",
        f"<p><strong>階段：</strong>{_esc(meta['phase'])} · "
        f"<strong>程度：</strong>{_esc(meta['level'])} · "
        f"<strong>預估：</strong>{meta['estimated_minutes']} 分鐘</p>",
        f"<p><strong>今日訓練：</strong>{_esc(meta['weekday_plan'])}</p>",
        "<hr>",
        "<h2>今日單字</h2>",
        "<table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse;width:100%'>",
        "<tr><th>單字</th><th>音標</th><th>解釋</th><th>狀態</th></tr>",
    ]

    for v in vocab:
        status = "複習" if v.get("status") == "review" else "新詞"
        parts.append(
            f"<tr><td><strong>{_esc(v['word'])}</strong></td>"
            f"<td>{_esc(v.get('phonetic_us', ''))}</td>"
            f"<td>{_esc(v.get('definition_tw', ''))}</td>"
            f"<td>{status}</td></tr>"
        )
    parts.append("</table>")

    parts += [
        "<hr>",
        "<h2>文法重點</h2>",
        f"<p><strong>{_esc(grammar['title'])}</strong></p>",
        f"<p>{_esc(grammar['explanation_tw'])}</p>",
        f"<p><em>{_esc(grammar['pattern'])}</em></p>",
        f"<p>{_esc(grammar['example_advanced'])}</p>",
        "<hr>",
        f"<h2>閱讀：{_esc(reading['title'])}</h2>",
        f"<p>{_esc(reading['text'])}</p>",
        f"<p><strong>中文翻譯：</strong>{_esc(reading['translation_tw'])}</p>",
        "<hr>",
        "<h2>跟讀練習（3 句）</h2>",
    ]

    for i, item in enumerate(listening, 1):
        parts.append(f"<h3>第 {i} 句</h3>")
        parts.append(f"<p><strong>{_esc(item['sentence'])}</strong></p>")
        parts.append(f"<p>發音提示：{_esc(item['pronunciation_tips_tw'])}</p>")
        parts.append(f"<p>跟讀步驟：{_esc(item['shadowing_steps_tw'])}</p>")

    parts += [
        "<hr>",
        "<h2>TOEFL 技能訓練</h2>",
        f"<p>{_esc(drill['instruction_tw'])}</p>",
        f"<p><strong>題目：</strong>{_esc(drill['prompt'])}</p>",
        f"<p><strong>架構：</strong>{_esc(drill['response_framework'])}</p>",
        f"<p><strong>範例：</strong>{_esc(drill['sample_answer'])}</p>",
        "<hr>",
        "<h2>每日測驗（含答案）</h2>",
    ]

    for q in quiz:
        parts.append(f"<p><strong>Q{q['question_id']}.</strong> {_esc(q['question'])}</p>")
        parts.append("<ul>")
        for opt in q["options"]:
            parts.append(f"<li>{_esc(opt)}</li>")
        parts.append("</ul>")
        parts.append(
            f"<p><strong>答案：{q['answer']}</strong> — {_esc(q['explanation_tw'])}</p>"
        )

    parts.append("<hr><p><em>祝學習順利！明日 09:00 將寄送下一課。</em></p>")
    return "".join(parts)
