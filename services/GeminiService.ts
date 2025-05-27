

import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { ProjectTypeOption, PortfolioFileContent } from "../types";

// API Key check - directly use process.env.API_KEY
if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. Gemini Service will not function.");
}

// Initialize Gemini AI client - directly use process.env.API_KEY and assert non-null
// as per guideline "Assume this variable is pre-configured, valid, and accessible"
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generatePortfolioPrompt = (userSpecifics: string): string => `
You are a world-class web design and development AI, specializing in creating stunning, modern, and **ready-to-deploy** single-page developer portfolio websites.
Your mission is to generate the complete HTML body content, CSS, and JavaScript for a portfolio that is not only functional but also **exceptionally beautiful, highly sophisticated, and showcases advanced web development techniques.**
The output components (HTML, CSS, JS) must be structured to be easily assembled into a **self-contained single-page application**, ready for immediate deployment by embedding the CSS in a <style> tag and the JS in a <script> tag within a standard HTML document structure. All code must be self-contained; do not reference external image files or libraries unless they are universally available via CDN and absolutely essential. Prefer SVG placeholders or pure CSS for visual elements where possible.

User's specific requirements for the portfolio content and theme: "${userSpecifics}"

**Core Sections (adapt and enhance based on user specifics, ensuring a cohesive and polished narrative/presentation):**
1.  **Hero Section:** A visually striking and impactful introduction. Compelling headline, a concise professional summary, and potentially a call-to-action.
2.  **About Me:** An engaging narrative. Go beyond a simple list of skills; tell a story. Highlight unique strengths, passions, and career aspirations as guided by the user's prompt.
3.  **Projects Showcase:** A visually appealing and interactive way to present 2-4 key projects. For each project:
    *   Visually appealing placeholder (e.g., well-styled div, SVG, or if image URLs are used, ensure they are generic placeholders like from placehold.co).
    *   Project title and concise, impactful description.
    *   Technologies used (icons or badges are a plus, implementable with HTML/CSS/SVG).
    *   Placeholder links for live demo/source code (e.g., '#').
    *   Consider modern layouts like cards, a filterable gallery, or modals for project details.
4.  **Skills & Expertise:** A well-organized and visually clear presentation of technical skills, tools, and technologies. Consider categorizing skills or using visual indicators of proficiency if appropriate (e.g., bar charts made with CSS).
5.  **Experience (Optional but Recommended):** If relevant to the user's prompt, include a brief timeline or list of professional/relevant experiences.
6.  **Contact / Call to Action:** Clean and professional contact information (e.g., email, LinkedIn placeholders) and/or a simple, aesthetically pleasing placeholder for a contact form structure.

**Design & Technical Excellence - This is CRITICAL:**
*   **Aesthetics:** Aim for a **breathtaking, unique, and highly polished visual design**. Utilize modern typography, harmonious color palettes (consider generating one if not specified by the user, using CSS custom properties), and ample white space. The design should feel custom and high-end.
*   **Responsiveness:** Flawless adaptability across all device sizes (mobile, tablet, desktop, large screens) using modern CSS techniques (Flexbox, Grid, media queries).
*   **Interactivity & Animations:** Implement subtle, tasteful, and performant animations and micro-interactions using CSS transitions/animations and minimal, efficient Vanilla JavaScript to enhance user experience (e.g., on-scroll reveal animations, hover effects, smooth transitions).
*   **Performance:** Optimize for fast loading times. Ensure clean, efficient code. Minify CSS and JS if possible within the generation.
*   **Accessibility (A11y):** Adhere to WCAG guidelines. Semantic HTML5, ARIA attributes where necessary (e.g., for interactive elements, landmarks), keyboard navigability, and sufficient color contrast.
*   **Code Quality:**
    *   **HTML Body Content:** Clean, semantic HTML5. Well-indented and organized. All content should be directly embeddable within a \`<body>\` tag.
    *   **CSS:** Modern, well-organized CSS (Flexbox, Grid). Extensively use CSS custom properties for theming (colors, fonts, spacing). Avoid overly complex selectors. Ensure CSS is robust and styles all HTML elements.
    *   **JavaScript:** Clean, efficient, and unobtrusive Vanilla JavaScript for interactions. No external libraries unless absolutely critical and easily inlined/embedded. All JS should be modern (ES6+) and wrapped in an IIFE or similar to avoid global scope pollution.

**Output Format - STRICTLY ADHERE:**
Return ONLY a single, valid JSON object with the following exact structure. Do not include any text or markdown before or after this JSON object:
{
  "html_content": "<!-- The complete HTML markup for all content that should appear directly inside the document's main body element. Do NOT include the <html>, <head>, or the body element tags themselves. This content will be injected into a template. Ensure all interactive elements have appropriate ARIA attributes. -->",
  "css_content": "/* All site-wide CSS rules. This content will be placed inside a <style> tag in the HTML <head>. Make it comprehensive, well-organized, and ensure it styles all elements defined in html_content. Utilize CSS custom properties extensively for theming. Ensure responsiveness and accessibility considerations. */",
  "javascript_content": "// All site-wide JavaScript code for interactivity. This content will be placed inside a <script> tag at the end of the HTML <body>. Ensure it's wrapped appropriately (e.g., IIFE), uses modern ES6+ features, is efficient, and targets elements in html_content correctly. */"
}

**Important Considerations for the AI:**
*   **User Prompt Integration:** The user's specifics in "${userSpecifics}" are paramount. The portfolio's content, tone, and even stylistic hints should be deeply influenced by it.
*   **Creativity & Sophistication:** Be highly creative and aim to impress. Don't just produce a generic template; create something memorable and sophisticated.
*   **Completeness & Polish:** Ensure all sections are well-fleshed out, the design is cohesive, and the site feels complete and polished.
*   **Self-Contained:** All code (HTML, CSS, JS) must be self-contained and ready for direct embedding.

Generate a portfolio that a top-tier developer would be proud to call their own, demonstrating cutting-edge design and development practices.
`;

const generateSnippetPrompt = (prompt: string, language: string): string => `
You are an expert code generation AI. Your primary goal is to provide exceptionally high-quality, clean, correct, efficient, and well-formatted code in ${language} that demonstrates best practices and modern language features.
The code MUST be production-ready, idiomatic for ${language}, and optimized for clarity and performance.

Request:
${prompt}

IMPORTANT INSTRUCTIONS:
1.  ONLY output the raw code for the ${language} snippet.
2.  DO NOT include any explanatory text, comments (unless explicitly requested by the user or are standard practice like docstrings/JSDoc for functions/classes), or markdown formatting (like \`\`\`${language} ... \`\`\`).
3.  If the request implies a function, class, or a complete runnable block, ensure the output is a complete and usable definition.
4.  The code must be robust and handle common edge cases implicitly or explicitly if appropriate for a snippet of this nature.
5.  Focus on fulfilling the coding task directly, producing code that could serve as a model example of excellence in ${language}.
6.  Adhere strictly to ${language} coding conventions and style guides (e.g., PEP 8 for Python).
`;

const generateApiEndpointPrompt = (prompt: string, language: string): string => `
You are an expert backend development AI, specializing in secure, scalable, and maintainable APIs.
Generate a production-quality API endpoint in ${language} based on the following request.
If a framework is specified by the user (e.g., Express for JavaScript, Flask/Django for Python, Spring Boot for Java), adhere to that framework's best practices meticulously. Otherwise, use common, modern conventions and standard libraries for the language.
Request: "${prompt}"

Focus on a well-structured handler, controller, or route definition for this endpoint. The generated code should be a complete, runnable example for the specified part of the API.
Key requirements for the generated code:
*   **Security:** Implement input validation and sanitization. Protect against common vulnerabilities (e.g., injection attacks if relevant to the language/framework).
*   **Efficiency:** Code should be performant and use resources judiciously.
*   **Error Handling:** Include appropriate error handling, returning correct HTTP status codes (e.g., 400 for bad request, 404 for not found, 500 for server error) and informative error messages in a structured format (preferably JSON).
*   **RESTful Principles:** Follow RESTful principles if applicable (correct use of HTTP methods, status codes, resource Naming).
*   **Maintainability:** Code should be well-structured, clearly written, and include necessary comments or documentation (e.g., JSDoc, Python docstrings) to explain logic, parameters, and return values.
*   **Idempotency:** Consider idempotency for relevant HTTP methods (e.g., PUT, DELETE).

IMPORTANT INSTRUCTIONS:
1.  Provide ONLY the raw code for the ${language} API endpoint.
2.  The code must be correctly formatted, complete, and ready to be integrated into a larger application.
3.  DO NOT include any surrounding markdown, boilerplate not part of the code itself, or explanatory text outside of code comments/docstrings.
`;

const generateUiComponentPrompt = (prompt: string, language: string): string => `
You are an expert frontend development AI, specializing in creating high-quality, reusable, and accessible UI components.
Generate a UI component based on the following request using ${language}.
If a framework is specified (e.g., React, Vue, Angular, Svelte for JavaScript/TypeScript, or plain HTML/CSS/JS), adhere to its conventions and best practices.
Request: "${prompt}"

Key requirements for the generated component:
*   **Reusability:** The component should be designed to be reusable in different contexts. Define props clearly if applicable.
*   **Performance:** Ensure the component is performant, especially if it involves rendering lists or handling frequent updates.
*   **Accessibility (A11y):**
    *   If ${language} is HTML or involves HTML generation (e.g., JSX), ensure semantic HTML and include necessary ARIA attributes for roles, states, and properties.
    *   Ensure keyboard navigability and focus management for interactive elements.
*   **Styling (if applicable):**
    *   If ${language} is CSS, it should be well-structured (e.g., BEM, utility classes, or modern approaches), responsive, and clean.
    *   If a JS framework, styling can be CSS Modules, CSS-in-JS, or global CSS, following common patterns for that framework. Ensure styles are scoped or namespaced to avoid conflicts.
*   **Structure & Logic:**
    *   For frameworks (React, Vue, etc.), utilize their core features effectively (e.g., state management, props, lifecycle methods/hooks, composition).
    *   The component should be self-contained or have clearly defined dependencies.
*   **Documentation:** Include comments or JSDoc-style documentation (for JS/TS) explaining props, state, and complex logic.

IMPORTANT INSTRUCTIONS:
1.  Return ONLY the raw, complete code for the component.
2.  The code should be well-organized, correctly formatted for ${language}, and ready to be integrated.
3.  DO NOT include any markdown formatting or surrounding explanatory text outside of code comments/docstrings.
`;

const generateUnitTestPrompt = (prompt: string, language: string): string => `
You are an expert software testing AI, proficient in writing comprehensive and effective unit tests.
Generate high-quality unit tests in ${language} for the described functionality or code.
If a testing framework is specified by the user (e.g., Jest/Mocha for JavaScript, PyTest/unittest for Python, JUnit for Java), use it according to its best practices. Otherwise, use a common and modern testing framework for ${language}.
Functionality/Code to test: "${prompt}"

Key requirements for the generated tests:
*   **Thoroughness:** Cover happy paths, edge cases, boundary conditions, and invalid inputs to ensure robustness.
*   **Coverage:** Aim for high test coverage of the logic described.
*   **Assertions:** Use meaningful, specific, and precise assertions.
*   **Structure:** Follow the AAA (Arrange, Act, Assert) pattern for structuring individual tests.
*   **Independence:** Tests should be independent and not rely on the state or outcome of other tests.
*   **Mocking/Stubbing:** Use mock objects, stubs, or spies appropriately if external dependencies or complex collaborators are implied.
*   **Clarity:** Test names and structure should clearly indicate what is being tested. Include comments if the test setup or logic is complex.

IMPORTANT INSTRUCTIONS:
1.  Provide ONLY the raw code for the ${language} unit tests.
2.  The code must be correctly formatted for the specified (or assumed) testing framework and language.
3.  DO NOT include any markdown formatting or explanatory text outside of code comments.
4.  Ensure all necessary imports and basic setup/teardown logic (if required by the framework for the tests) are included.
`;

const generateDbSchemaPrompt = (prompt: string): string => `
You are an expert database design AI, skilled in creating efficient, normalized, and robust database schemas.
Generate SQL DDL (Data Definition Language) statements to create a well-designed database schema based on the following request.
Use standard SQL syntax compatible with PostgreSQL or MySQL, unless a specific dialect is requested.
Request: "${prompt}"

Key requirements for the generated DDL:
*   **Normalization:** The schema should be appropriately normalized (e.g., 3NF) to reduce redundancy and improve data integrity, unless denormalization is explicitly requested for a specific reason.
*   **Data Types:** Meticulously choose the most specific, efficient, and appropriate data types for each column.
*   **Keys:** Define primary keys for all tables. Define foreign keys to enforce relationships, including appropriate \`ON DELETE\` and \`ON UPDATE\` cascade or restrict behaviors.
*   **Constraints:** Utilize \`NOT NULL\`, \`UNIQUE\`, and \`CHECK\` constraints to maintain data integrity.
*   **Indexes:** Create indexes on columns frequently used in \`WHERE\` clauses, \`JOIN\` conditions, or for ordering, to optimize query performance. Consider composite indexes where appropriate.
*   **Comments:** Include comments on tables and columns (e.g., using \`COMMENT ON TABLE ...\` or \`COMMENT ON COLUMN ...\`) if their purpose, constraints, or relationships are not immediately obvious from their names or definitions.
*   **Readability:** SQL DDL should be well-formatted and easy to read.

IMPORTANT INSTRUCTIONS:
1.  Provide ONLY the raw SQL DDL statements (primarily \`CREATE TABLE\`, \`ALTER TABLE ADD CONSTRAINT\`, \`CREATE INDEX\`, \`COMMENT ON\`).
2.  DO NOT include any markdown formatting or explanatory text outside of SQL comments (e.g., \`-- comment\` or \`/* comment */\`).
3.  Ensure the statements are in a logical order for execution (e.g., tables created before foreign keys reference them).
`;

const generateRegexPrompt = (promptText: string): string => `
You are an expert in regular expressions, capable of crafting highly accurate, efficient, and maintainable patterns.
Generate a regular expression based on the following description of the pattern to match.
The regex should be as efficient and accurate as possible. Consider edge cases and potential pitfalls. If there are multiple ways to achieve the goal, prefer the most readable and maintainable one that doesn't significantly sacrifice performance.
The pattern should be compatible with standard regular expression engines (e.g., PCRE-like, or as supported by common languages like JavaScript, Python) unless specified otherwise by the user.

Description: "${promptText}"

IMPORTANT INSTRUCTIONS:
1.  Provide ONLY the regular expression pattern itself.
2.  DO NOT include enclosing slashes (e.g., \`/pattern/\`), flags (e.g., \`g\`, \`i\`, \`m\`) unless they are an intrinsic part of the pattern syntax for a specific flavor AND the user's request implies their necessity. Focus on the core pattern.
3.  DO NOT include any explanatory text, comments, or markdown formatting.
`;

const generateAutomationScriptPrompt = (promptText: string, language: string): string => `
You are an expert in scripting and automation, focusing on creating robust, maintainable, and efficient scripts in ${language}.
Generate a script in ${language} for the automation task described below.
The script should be production-quality: robust, include comprehensive error handling (e.g., try-catch blocks, checking return codes/statuses), and potentially logging for important actions or issues using a standard logging module if available in ${language}.
Task: "${promptText}"

Key requirements for the generated script:
*   **Executability:** The script should be self-contained and executable. For interpreted languages like Python, include a main execution block (e.g., \`if __name__ == '__main__':\`) and a shebang (e.g., \`#!/usr/bin/env python3\`) if conventional.
*   **Configuration:** Make it configurable if applicable (e.g., via command-line arguments using standard libraries like \`argparse\` in Python, or environment variables). Define sensible defaults.
*   **Idempotency (if applicable):** If the script makes changes, consider if it can be run multiple times with the same effect.
*   **Modularity:** If the script is complex, break it down into functions or classes for better organization.
*   **Resource Management:** Ensure proper handling of resources like files or network connections (e.g., using \`with\` statements in Python).
*   **Dependencies:** Clearly state any non-standard library dependencies in comments at the top of the script if they are essential.
*   **Comments & Readability:** Include comments explaining complex parts, assumptions, and overall logic. Code should be well-formatted and readable.

IMPORTANT INSTRUCTIONS:
1.  Return ONLY the raw code for the ${language} script.
2.  The code must be complete, correctly formatted, and as ready-to-run as possible.
3.  DO NOT include any markdown formatting or explanatory text outside of code comments or docstrings.
`;

const generateExplanationForProvidedCodePrompt = (codeToExplain: string, language: string): string => `
You are an expert code explainer AI. Your mission is to provide exceptionally clear, concise, precise, and well-structured explanations for code snippets.
Given the following ${language} code, generate a comprehensive yet easy-to-understand explanation.

Code to Explain:
\`\`\`${language}
${codeToExplain}
\`\`\`

**Explanation Guidelines:**

**Structure & Content:**
1.  **Overall Summary (Required):**
    *   Start with a heading like \`## Overall Summary\`.
    *   Provide a 1-2 sentence high-level overview of the code's primary purpose and functionality.
2.  **Key Functionality Breakdown (Required):**
    *   Use a heading like \`## Key Functionality Breakdown\`.
    *   Use Markdown bullet points (\`-\`) or numbered lists (\`1.\`) to detail distinct logical parts, functions, classes, or significant code blocks.
    *   For each item, explain its specific role, the logic it implements, and any important variables, parameters, or control flow (loops, conditionals). Be precise.
3.  **Language Features & Patterns (If Applicable):**
    *   Use a heading like \`## Language Features & Patterns\`.
    *   Highlight any notable ${language}-specific idioms, language features (e.g., async/await, list comprehensions, generics), design patterns (e.g., Factory, Singleton), or advanced techniques utilized in the code. Explain *why* they are relevant or beneficial in this context.
4.  **Potential Considerations (Optional but Recommended):**
    *   Use a heading like \`## Potential Considerations\`.
    *   Briefly mention any implicit assumptions made by the code, edge cases handled (or not handled), or areas where a developer might need to be cautious (e.g., error handling, performance implications for large inputs).

**Style & Formatting:**
*   **Clarity & Conciseness:** Be technically accurate but use clear, accessible language. Avoid unnecessary jargon. Get straight to the point.
*   **Focus:** Explain the *existing* code's behavior, structure, and intent. Do not suggest extensive rewrites unless specifically asked.
*   **Emphasis:** Use **bold text** (\`**text**\`) for emphasis on key terms, concepts, function names, or important takeaways.
*   **Inline Code:** Use **inline code backticks** (e.g., \`variable_name\`, \`functionName()\`, \`ClassName\`) for all variable names, function/method names, class names, keywords, and short code snippets mentioned within sentences.
*   **Markdown Usage:**
    *   Utilize Markdown for all structuring: headings (\`##\`, \`###\`), bullet points (\`-\` or \`*\`), numbered lists (\`1.\`), bold (\`**bold**\`), and inline code (\`\`code\`\`).
    *   Ensure good use of paragraphs for readability and logical separation of ideas.
*   **Tone:** Maintain an informative, objective, and helpful tone.

**CRITICAL Output Instructions:**
1.  **Return ONLY the Markdown-formatted textual explanation.**
2.  **ABSOLUTELY DO NOT wrap the entire explanation output in triple backticks (e.g., \`\`\`markdown ... \`\`\` or \`\`\`text ... \`\`\`).** The response should start directly with your Markdown content (e.g., starting with \`## Overall Summary\`).
3.  **Do NOT repeat or include the original "Code to Explain" in your response.** Focus solely on the explanation.
`;


export class GeminiService {
  static async generate(
    prompt: string,
    projectType: ProjectTypeOption['value'],
    language?: string // Optional, used when projectType requires it
  ): Promise<string | PortfolioFileContent> {
    if (!process.env.API_KEY) {
      throw new Error("API Key for Gemini is not configured. Please set the API_KEY environment variable.");
    }

    let fullPrompt: string;
    let expectJson = false;
    // This system instruction is a general fallback. The individual prompts now carry more specific role-playing and instructions.
    let systemInstruction = "You are an AI assistant that generates exceptionally high-quality, production-ready code. Adhere strictly to the user's language, format, and detailed instructions provided in their main prompt. Ensure code is correct, efficient, robust, and follows best practices for the specified language and task.";

    switch (projectType) {
      case 'portfolio':
        fullPrompt = generatePortfolioPrompt(prompt);
        expectJson = true;
        // For portfolio, responseMimeType: "application/json" is critical.
        // The detailed portfolio prompt itself acts as a strong system instruction.
        break;
      case 'api_endpoint':
        if (!language) throw new Error("Language is required for API Endpoint generation.");
        fullPrompt = generateApiEndpointPrompt(prompt, language);
        break;
      case 'ui_component':
        if (!language) throw new Error("Language/Framework is required for UI Component generation.");
        fullPrompt = generateUiComponentPrompt(prompt, language);
        break;
      case 'unit_test':
        if (!language) throw new Error("Language is required for Unit Test generation.");
        fullPrompt = generateUnitTestPrompt(prompt, language);
        break;
      case 'db_schema':
        fullPrompt = generateDbSchemaPrompt(prompt);
        break;
      case 'regex_generation':
        fullPrompt = generateRegexPrompt(prompt);
        // Regex prompt is very specific about raw output, system instruction might be less impactful here but harmless.
        break;
      case 'automation_script':
        if (!language) throw new Error("Language is required for Automation Script generation.");
        fullPrompt = generateAutomationScriptPrompt(prompt, language);
        break;
      case 'snippet':
      default:
        if (!language) throw new Error("Language is required for Snippet generation.");
        fullPrompt = generateSnippetPrompt(prompt, language);
        break;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: fullPrompt,
        config: expectJson
          ? { responseMimeType: "application/json" }
          : { systemInstruction: systemInstruction }, // Use general systemInstruction for non-JSON, as specific instructions are in fullPrompt
      });

      const textResponse = response.text;
      // For JSON, textResponse could be an empty string if API returns that, parsing will fail later.
      // For non-JSON, an empty string from API is an issue.
      if (!textResponse && !expectJson) {
        throw new Error("Received an empty response from the API. The prompt might have been too restrictive or unclear.");
      }

      if (expectJson) {
        const jsonStr = (textResponse || "").trim();
        if (!jsonStr) {
             throw new Error("Received an empty or whitespace-only JSON response from the API for portfolio. Ensure the prompt allows for valid JSON output.");
        }
        // JSON parsing for portfolio is critical and assumes a specific structure defined in the prompt.
        // The prompt for portfolio explicitly asks for NO markdown fences.
        // If fences are still returned, it's a deviation by the model.
        // For robustness, we can still check but log a warning if fences were found.
        let parsableString = jsonStr;
        const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[1]) {
          console.warn("GeminiService: Markdown fences found around JSON response for portfolio, though prompt requested no fences. Stripping them.");
          parsableString = match[1].trim();
        }
        if (!parsableString) {
            throw new Error("JSON content is empty after attempting to remove markdown fences. The AI response might be malformed.");
        }
        try {
            const parsedJson = JSON.parse(parsableString);
            // Add validation for the expected structure of PortfolioFileContent
            if (typeof parsedJson !== 'object' || parsedJson === null ||
                typeof parsedJson.html_content !== 'string' ||
                typeof parsedJson.css_content !== 'string' ||
                typeof parsedJson.javascript_content !== 'string') {
                console.error("Parsed JSON does not match PortfolioFileContent structure:", parsedJson);
                throw new Error("The AI's JSON response does not conform to the expected portfolio structure (html_content, css_content, javascript_content strings).");
            }
            return parsedJson as PortfolioFileContent;
        } catch (e: any) {
            console.error("Failed to parse JSON response from AI. Original text (after potential fence removal):", parsableString.substring(0, 500) + "...", "Error:", e);
            throw new Error(`The AI's response, expected as JSON, was not parsable or did not match the required structure. Details: ${e.message}`);
        }
      }
      // For non-JSON, textResponse is guaranteed to be non-null here (checked earlier).
      // The prompts for non-JSON types strongly request no markdown fences around the entire code.
      // The explanation prompt NOW requests internal markdown, which is fine.
      return textResponse!; 

    } catch (error) {
      console.error(`Gemini API call for content generation failed (Project Type: ${projectType}):`, error);
      if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("Invalid API Key. Please check your API_KEY environment variable.");
        }
        // Provide more context in the error message
        throw new Error(`Failed to generate content for project type '${projectType}' via Gemini API: ${error.message}`);
      }
      throw new Error(`An unknown error occurred while communicating with the Gemini API for content generation (Project Type: ${projectType}).`);
    }
  }

  static async explainCode(codeToExplain: string, language: string): Promise<string> {
    if (!process.env.API_KEY) {
      throw new Error("API Key for Gemini is not configured. Please set the API_KEY environment variable.");
    }
    if (!codeToExplain.trim()) {
      return "There is no code to explain.";
    }

    const fullPrompt = generateExplanationForProvidedCodePrompt(codeToExplain, language);

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: fullPrompt,
        // The explanation prompt is highly directive.
        // No specific systemInstruction or responseMimeType needed here, as we expect Markdown text.
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("Received an empty explanation from the API.");
      }
      // The prompt now asks for Markdown, so we return it as is.
      // Trimming leading/trailing whitespace is generally safe.
      return textResponse.trim();

    } catch (error) {
      console.error("Gemini API call for code explanation failed:", error);
      if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("Invalid API Key. Please check your API_KEY environment variable for explanation.");
        }
        throw new Error(`Failed to get explanation via Gemini API: ${error.message}`);
      }
      throw new Error("An unknown error occurred while communicating with the Gemini API for explanation.");
    }
  }
}