function detectLanguage(code) {

    const patterns = {
        python: [
            /^\s*def\s+\w+\s*\(.*\)\s*:/m,
            /^\s*class\s+\w+\s*:/m,
            /^\s*import\s+\w+/m,
            /print\s*\(.*\)/,
            /^\s*#(?!include).*/m, // Match Python comments but not #include
            /\bself\b/,
            /\belif\b/,
            /\bNone\b/,
        ],
        java: [
            /^\s*public\s+class\s+\w+/m,
            /\bSystem\.out\.println\s*\(.*\)/,
            /\bimport\s+java\.\w+/,
            /\bpublic\s+(static\s+)?void\s+main\s*\(/,
            /\bnew\s+\w+\s*\(/,
        ],
        cpp: [
            /^\s*#include\s*<iostream>/m,
            /\bstd::\w+/,
            /\bcout\s*<</,
            /\bcin\s*>>/,
            /\busing\s+namespace\s+std\s*;/,
            /\bclass\s+\w+\s*{/,
        ],
        c: [
            /^\s*#include\s*<\w+\.h>/m,
            /\bprintf\s*\(/,
            /\bscanf\s*\(/,
            /\bint\s+main\s*\(/,
            /\bstruct\s+\w+/,
        ],
    };

    const score = { python: 0, java: 0, cpp: 0, c: 0 };

    for (const [lang, regexes] of Object.entries(patterns)) {
        for (const regex of regexes) {
            if (regex.test(code)) {
                score[lang]++;
            }
        }
    }

    // Resolve ambiguity between C and C++
    if (score.cpp > 0 && score.c > 0) {
        if (score.cpp >= score.c) score.c = 0;
        else score.cpp = 0;
    }

    // Determine max score
    const maxScore = Math.max(...Object.values(score));

    if (maxScore === 0) return '';

    const topMatches = Object.keys(score).filter(lang => score[lang] === maxScore);
    
    const priority = ['cpp', 'c', 'python', 'java'];
    
    for (const lang of priority) {
        if (topMatches.includes(lang)) {
            return lang;
        }
    }
    
    return '';
}