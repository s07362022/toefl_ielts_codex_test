#!/usr/bin/env python3
"""Expand vocab_full_bank.json to a 60-day sized TOEFL/IELTS phrase bank."""

from __future__ import annotations

import json
from pathlib import Path

BANK_PATH = Path(__file__).resolve().parent / "vocab_full_bank.json"
TARGET_SIZE = 1200

BASE_TERMS = [
    ("access", "取得；使用權", "Academic", "n./v."),
    ("adapt", "適應；調整", "Academic", "v."),
    ("adequate", "足夠的", "Academic", "adj."),
    ("adjust", "調整", "Daily", "v."),
    ("advantage", "優點", "IELTS", "n."),
    ("alternative", "替代方案", "Academic", "n./adj."),
    ("ambitious", "有企圖心的", "Business", "adj."),
    ("anxiety", "焦慮", "Daily", "n."),
    ("application", "應用；申請", "Academic", "n."),
    ("appropriate", "適當的", "Academic", "adj."),
    ("argument", "論點；爭論", "TOEFL", "n."),
    ("assessment", "評估", "Academic", "n."),
    ("assumption", "假設", "Academic", "n."),
    ("attitude", "態度", "TOEFL", "n."),
    ("audience", "聽眾；觀眾", "Business", "n."),
    ("authority", "權威；權力", "Academic", "n."),
    ("available", "可取得的", "Daily", "adj."),
    ("benefit", "好處；受益", "IELTS", "n./v."),
    ("capacity", "能力；容量", "Academic", "n."),
    ("challenge", "挑戰", "Daily", "n./v."),
    ("characteristic", "特徵", "Academic", "n./adj."),
    ("circumstance", "情況", "Academic", "n."),
    ("claim", "主張；聲稱", "TOEFL", "n./v."),
    ("coherent", "連貫的", "Academic", "adj."),
    ("community", "社群；社區", "IELTS", "n."),
    ("compare", "比較", "TOEFL", "v."),
    ("competence", "能力；勝任度", "Business", "n."),
    ("complex", "複雜的", "Academic", "adj."),
    ("component", "組成部分", "Academic", "n."),
    ("conclusion", "結論", "TOEFL", "n."),
    ("condition", "條件；狀況", "Academic", "n."),
    ("conduct", "進行；行為", "Academic", "v./n."),
    ("consequence", "後果", "Academic", "n."),
    ("considerable", "相當大的", "Academic", "adj."),
    ("constraint", "限制", "Business", "n."),
    ("consume", "消耗；消費", "IELTS", "v."),
    ("contribute", "貢獻；促成", "Academic", "v."),
    ("conventional", "傳統的", "Academic", "adj."),
    ("coordinate", "協調", "Business", "v."),
    ("core", "核心", "Academic", "n./adj."),
    ("criteria", "標準", "Academic", "n."),
    ("debate", "辯論；討論", "IELTS", "n./v."),
    ("decline", "下降；衰退", "Academic", "n./v."),
    ("dedicate", "投入；奉獻", "Business", "v."),
    ("define", "定義", "TOEFL", "v."),
    ("demanding", "要求高的", "Business", "adj."),
    ("dependency", "依賴", "Academic", "n."),
    ("design", "設計", "Academic", "n./v."),
    ("detect", "偵測；察覺", "TOEFL", "v."),
    ("dimension", "面向；維度", "Academic", "n."),
    ("disadvantage", "缺點", "IELTS", "n."),
    ("discuss", "討論", "Daily", "v."),
    ("distinct", "明顯不同的", "Academic", "adj."),
    ("distribution", "分配；分布", "Academic", "n."),
    ("domestic", "國內的；家庭的", "IELTS", "adj."),
    ("duration", "持續時間", "Academic", "n."),
    ("dynamic", "動態的；有活力的", "Academic", "adj."),
    ("economy", "經濟", "IELTS", "n."),
    ("effective", "有效的", "Daily", "adj."),
    ("element", "元素；要素", "Academic", "n."),
    ("emphasis", "強調", "TOEFL", "n."),
    ("enable", "使能夠", "Academic", "v."),
    ("energy", "能源；精力", "IELTS", "n."),
    ("engage", "參與；吸引", "Business", "v."),
    ("environment", "環境", "IELTS", "n."),
    ("equivalent", "相等的；等同物", "Academic", "adj./n."),
    ("essential", "必要的", "TOEFL", "adj."),
    ("evaluate", "評估", "Academic", "v."),
    ("evolve", "演變", "Academic", "v."),
    ("exclude", "排除", "Academic", "v."),
    ("expand", "擴展", "Business", "v."),
    ("expectation", "期待", "Business", "n."),
    ("exposure", "接觸；暴露", "TOEFL", "n."),
    ("external", "外部的", "Academic", "adj."),
    ("feature", "特色；特徵", "Academic", "n./v."),
    ("finance", "財務；金融", "Business", "n."),
    ("framework", "架構", "Academic", "n."),
    ("function", "功能；作用", "TOEFL", "n./v."),
    ("fundamental", "根本的", "Academic", "adj."),
    ("generate", "產生", "Academic", "v."),
    ("global", "全球的", "IELTS", "adj."),
    ("gradual", "逐漸的", "Academic", "adj."),
    ("guarantee", "保證", "Business", "n./v."),
    ("highlight", "強調；亮點", "Business", "v./n."),
    ("identity", "身份；認同", "IELTS", "n."),
    ("ignore", "忽略", "Daily", "v."),
    ("illustration", "說明；圖示", "Academic", "n."),
    ("implement", "實施", "Business", "v."),
    ("income", "收入", "IELTS", "n."),
    ("indicate", "指出；顯示", "TOEFL", "v."),
    ("individual", "個人；個別的", "Academic", "n./adj."),
    ("industry", "產業", "Business", "n."),
    ("initial", "最初的", "Academic", "adj."),
    ("insight", "洞察", "Business", "n."),
    ("integrate", "整合", "Academic", "v."),
    ("intense", "強烈的", "Daily", "adj."),
    ("interaction", "互動", "Academic", "n."),
    ("internal", "內部的", "Business", "adj."),
    ("invest", "投資", "Business", "v."),
    ("issue", "議題；問題", "IELTS", "n."),
    ("justify", "證明合理", "TOEFL", "v."),
    ("labor", "勞動；勞工", "Academic", "n."),
    ("logic", "邏輯", "Academic", "n."),
    ("majority", "多數", "Academic", "n."),
    ("manage", "管理；處理", "Daily", "v."),
    ("manual", "手動的；手冊", "Business", "adj./n."),
    ("margin", "差距；邊緣", "Academic", "n."),
    ("mature", "成熟的", "Academic", "adj."),
    ("mechanism", "機制", "TOEFL", "n."),
    ("medium", "媒介；中等的", "Academic", "n./adj."),
    ("mental", "心理的", "IELTS", "adj."),
    ("minor", "次要的", "Academic", "adj."),
    ("mode", "模式", "Academic", "n."),
    ("monitor", "監控", "Business", "v."),
    ("motivation", "動機", "Daily", "n."),
    ("mutual", "相互的", "Business", "adj."),
    ("network", "網絡；建立人脈", "Business", "n./v."),
    ("objective", "目標；客觀的", "Academic", "n./adj."),
    ("obtain", "取得", "TOEFL", "v."),
    ("occupy", "佔據", "Academic", "v."),
    ("option", "選項", "Daily", "n."),
    ("ordinary", "普通的", "Daily", "adj."),
    ("organize", "組織；整理", "Daily", "v."),
    ("outcome", "結果", "Academic", "n."),
    ("overall", "整體的", "Academic", "adj."),
    ("participate", "參與", "IELTS", "v."),
    ("pattern", "模式；型態", "TOEFL", "n."),
    ("perceive", "察覺；認為", "Academic", "v."),
    ("perform", "表現；執行", "Business", "v."),
    ("period", "時期", "Academic", "n."),
    ("policy", "政策", "IELTS", "n."),
    ("potential", "潛力；潛在的", "Academic", "n./adj."),
    ("predict", "預測", "TOEFL", "v."),
    ("preserve", "保存；保護", "Academic", "v."),
    ("primary", "主要的", "Academic", "adj."),
    ("principle", "原則", "Academic", "n."),
    ("procedure", "程序", "Business", "n."),
    ("professional", "專業人士；專業的", "Business", "n./adj."),
    ("project", "專案", "Business", "n."),
    ("promote", "促進；推廣", "Business", "v."),
    ("proportion", "比例", "Academic", "n."),
    ("publication", "出版品；發表", "Academic", "n."),
    ("purchase", "購買", "Business", "n./v."),
    ("quality", "品質", "Business", "n."),
    ("range", "範圍", "Academic", "n."),
    ("react", "反應", "Daily", "v."),
    ("region", "區域", "IELTS", "n."),
    ("regulate", "規範；調節", "Academic", "v."),
    ("reinforce", "強化", "TOEFL", "v."),
    ("reject", "拒絕；駁回", "Academic", "v."),
    ("relationship", "關係", "IELTS", "n."),
    ("reliable", "可靠的", "Business", "adj."),
    ("remove", "移除", "Daily", "v."),
    ("require", "需要；要求", "TOEFL", "v."),
    ("research", "研究", "Academic", "n./v."),
    ("resource", "資源", "Business", "n."),
    ("respond", "回應", "Daily", "v."),
    ("restrict", "限制", "Academic", "v."),
    ("reveal", "揭露；顯示", "TOEFL", "v."),
    ("role", "角色", "Academic", "n."),
    ("sector", "部門；產業", "Business", "n."),
    ("sequence", "順序", "Academic", "n."),
    ("shift", "轉變", "Academic", "n./v."),
    ("specific", "具體的", "TOEFL", "adj."),
    ("stable", "穩定的", "Academic", "adj."),
    ("standard", "標準", "Business", "n./adj."),
    ("structure", "結構", "Academic", "n./v."),
    ("sufficient", "足夠的", "Academic", "adj."),
    ("survey", "調查", "Academic", "n./v."),
    ("symbol", "象徵；符號", "Academic", "n."),
    ("target", "目標", "Business", "n./v."),
    ("technical", "技術的", "Business", "adj."),
    ("temporary", "暫時的", "Daily", "adj."),
    ("theory", "理論", "TOEFL", "n."),
    ("topic", "主題", "Daily", "n."),
    ("transfer", "轉移；轉讓", "Business", "v./n."),
    ("transform", "轉變", "Academic", "v."),
    ("trend", "趨勢", "IELTS", "n."),
    ("unique", "獨特的", "Daily", "adj."),
    ("validity", "有效性", "Academic", "n."),
    ("variable", "變數；可變的", "Academic", "n./adj."),
    ("version", "版本", "Business", "n."),
    ("visible", "可見的", "Daily", "adj."),
    ("volume", "量；音量", "Academic", "n."),
    ("welfare", "福利", "IELTS", "n."),
]


def load_existing() -> dict[str, dict]:
    if not BANK_PATH.exists():
        return {}
    return json.loads(BANK_PATH.read_text(encoding="utf-8")).get("words", {})


def safe_id(text: str) -> str:
    return text.lower().replace(" ", " ").strip()


def phrase_variants(word: str, type_: str) -> list[str]:
    if type_.startswith("v"):
        return [
            f"{word} evidence",
            f"{word} a passage",
            f"{word} a trend",
            f"{word} results",
            f"{word} a response",
            f"{word} information",
            f"{word} effectively",
            f"{word} in context",
        ]
    if type_.startswith("adj"):
        return [
            f"{word} approach",
            f"{word} factor",
            f"{word} response",
            f"{word} evidence",
            f"highly {word}",
            f"{word} for learners",
            f"{word} in academic writing",
            f"{word} in daily communication",
        ]
    return [
        f"key {word}",
        f"academic {word}",
        f"{word} development",
        f"{word} strategy",
        f"{word} in context",
        f"{word} and examples",
        f"{word} for speaking",
        f"{word} for writing",
    ]


def make_entry(word: str, type_: str, category: str, definition_tw: str) -> dict:
    return {
        "type": type_,
        "phonetic_us": "",
        "category": category,
        "definition_tw": definition_tw,
        "example": f"The phrase '{word}' is useful when discussing study, work, or academic topics.",
        "collocation": word,
        "usage_note_tw": "此項目作為 TOEFL/IELTS 與日常商務表達的可抽取詞彙或片語。",
    }


def main() -> int:
    words = load_existing()

    for word, definition_tw, category, type_ in BASE_TERMS:
        words.setdefault(
            safe_id(word),
            make_entry(word, type_, category, definition_tw),
        )

    for word, definition_tw, category, type_ in BASE_TERMS:
        for phrase in phrase_variants(word, type_):
            if len(words) >= TARGET_SIZE:
                break
            words.setdefault(
                safe_id(phrase),
                make_entry(
                    phrase,
                    "phrase",
                    category,
                    f"與「{definition_tw}」相關的常用片語",
                ),
            )
        if len(words) >= TARGET_SIZE:
            break

    if len(words) < TARGET_SIZE:
        raise RuntimeError(f"Bank only has {len(words)} entries; add more base terms.")

    BANK_PATH.write_text(
        json.dumps({"words": words}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"VOCAB_BANK_EXPANDED {len(words)} entries -> {BANK_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
