(function () {
    const inputArea = document.getElementById('input');
    const outputArea = document.getElementById('output');
    const obfuscateBtn = document.getElementById('obfuscate-btn');
    const copyBtn = document.getElementById('copy-btn');

    const robloxGlobals = new Set([
        "game", "workspace", "script", "Instance", "Enum", "Color3", "Vector3", "CFrame",
        "wait", "task", "spawn", "delay", "print", "warn", "error", "type", "tostring",
        "tonumber", "pairs", "ipairs", "next", "getmetatable", "setmetatable", "math",
        "string", "table", "coroutine", "debug", "os", "tick", "shared", "_G",
        "plugin", "require", "UDim2", "UDim", "RaycastParams", "Ray", "BrickColor",
        "TweenInfo", "Region3", "Faces", "Axes", "DateTime", "NumberRange", "NumberSequence",
        "ColorSequence", "PhysicalProperties", "Rect", "Font", "CatalogSearchParams",
        "OverlapParams", "DockWidgetPluginGuiInfo", "FloatCurveKey", "PathWaypoint",
        "RotationCurveKey", "assert", "collectgarbage", "pcall", "xpcall", "select",
        "rawset", "rawget", "rawequal", "unpack", "utf8", "bit32", "getfenv", "setfenv"
    ]);

    function generateName(length = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let res = 'v_';
        for (let i = 0; i < length; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
    }

    function obfuscateStrings(code) {
        return code.replace(/("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')/g, (match) => {
            const content = match.slice(1, -1);
            if (!content) return match;
            let encoded = "";
            for (let i = 0; i < content.length; i++) {
                encoded += "\\" + content.charCodeAt(i);
            }
            return `"${encoded}"`;
        });
    }

    function removeComments(code) {
        let clean = code.replace(/--\[\[[\s\S]*?\]\]/g, '');
        clean = clean.replace(/--.*/g, '');
        return clean;
    }

    function obfuscateBooleans(code) {
        let res = code.replace(/\btrue\b/g, '(1 == 1)');
        res = res.replace(/\bfalse\b/g, '(1 == 2)');
        return res;
    }

    function renameLocals(code) {
        const varMap = {};
        // Find local a, b, c = ...
        const localRegex = /\blocal\s+(?:function\s+)?([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/g;
        let match;

        while ((match = localRegex.exec(code)) !== null) {
            const names = match[1].split(',').map(n => n.trim());
            for (const name of names) {
                if (!robloxGlobals.has(name) && !name.startsWith('v_') && !varMap[name]) {
                    varMap[name] = generateName();
                }
            }
        }

        // Find function parameters
        const paramRegex = /function\s*(?:[a-zA-Z_][a-zA-Z0-9_]*)?\s*\(([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\)/g;
        while ((match = paramRegex.exec(code)) !== null) {
            const names = match[1].split(',').map(n => n.trim());
            for (const name of names) {
                if (!robloxGlobals.has(name) && !name.startsWith('v_') && !varMap[name]) {
                    varMap[name] = generateName();
                }
            }
        }

        const sortedOldNames = Object.keys(varMap).sort((a, b) => b.length - a.length);
        let result = code;
        for (const old of sortedOldNames) {
            const regex = new RegExp(`(?<![.:])\\b${old}\\ b`.replace(' ', ''), 'g');
            result = result.replace(regex, varMap[old]);
        }
        return result;
    }

    function injectJunk(code) {
        const lines = code.split('\n');
        const newLines = [];
        for (const line of lines) {
            newLines.push(line);
            if (Math.random() < 0.3) {
                const v = generateName(6);
                const val = Math.floor(Math.random() * 1000);
                newLines.push(`local ${v} = ${val};`);
                if (Math.random() < 0.5) {
                    newLines.push(`if ${v} > ${Math.floor(Math.random() * 500)} then ${v} = ${v} + 1 end;`);
                }
            }
        }
        return newLines.join('\n');
    }

    function minify(code) {
        // Ensure semicolons before minifying if they are missing
        let res = code.replace(/([^\s;])\n/g, '$1;\n');
        return res.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, ' ').trim();
    }

    obfuscateBtn.addEventListener('click', () => {
        let code = inputArea.value;
        if (!code) return;

        code = removeComments(code);
        code = obfuscateBooleans(code);
        code = obfuscateStrings(code);
        code = renameLocals(code);
        code = injectJunk(code);
        code = minify(code);

        outputArea.value = code;

        obfuscateBtn.textContent = 'DONE!';
        setTimeout(() => obfuscateBtn.textContent = 'OBFUSCATE', 1000);
    });

    copyBtn.addEventListener('click', () => {
        outputArea.select();
        document.execCommand('copy');
        const oldText = copyBtn.textContent;
        copyBtn.textContent = 'COPIED!';
        setTimeout(() => copyBtn.textContent = oldText, 1000);
    });
})();
