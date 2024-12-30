function parseMarkdown(input) {
  // 1. Convert headings (e.g. # Heading 1, ## Heading 2)
  input = input.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
  input = input.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  input = input.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

  // 2. Convert bold text (**bold**)
  input = input.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 3. Convert italic text (*italic*)
  input = input.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // 4. Convert custom note block (::note:: text ::note::)
  input = input.replace(/::note::(.*?)::note::/g, '<div class="note">$1</div>');

  // 5. Convert highlight text (==highlight==)
  input = input.replace(/==([^=]+)==/g, '<span class="highlight">$1</span>');

  // 6. Convert images (![alt text](URL))
  input = input.replace(
    /\!\[([^\[]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<img src="$2" alt="$1">'
  );

  // 7. Convert links ([Link Text](URL))
  input = input.replace(
    /\[([^\[]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  // 8. Convert unordered lists (- or *)
  input = input.replace(/^[*-]\s+(.*)$/gm, function (match, p1) {
    return `<li>${p1}</li>`;
  });

  // 9. Convert ordered lists (1. , 2. , 3. , ...)
  input = input.replace(/^(\d+)\.\s+(.*)$/gm, function (match, p1, p2) {
    return `<li>${p2}</li>`;
  });

  input = input.replace(/(<li>.*<\/li>)/gs, function (match) {
    if (match.match(/^<li>\d+\./)) {
      return `<ol>${match}</ol>`;
    } else {
      return `<ul>${match}</ul>`;
    }
  });

  return input;
}

function reverseMarkdown(input) {
  input = cleanInput(input);
  input = input.replace(/<h1>(.*?)<\/h1>/g, "# $1");

  input = input.replace(/<h2>(.*?)<\/h2>/g, "## $1");

  input = input.replace(/<h3>(.*?)<\/h3>/g, "### $1");

  input = input.replace(/<strong>(.*?)<\/strong>/g, "**$1**");

  input = input.replace(/<em>(.*?)<\/em>/g, "*$1*");

  input = input.replace(
    /<div class="note">(.*?)<\/div>/g,
    "::note::$1::note::"
  );

  input = input.replace(/<span class="highlight">(.*?)<\/span>/g, "==$1==");

  input = input.replace(
    /<a href="(https?:\/\/[^\"]+)">(.*?)<\/a>/g,
    "[$2]($1)"
  );

  input = input.replace(
    /<img src="(https?:\/\/[^\"]+)" alt="([^"]+)">/g,
    "![$2]($1)"
  );

  input = input.replace(/<ul>(.*?)<\/ul>/gs, (match, group) => {
    return group.replace(/<li>(.*?)<\/li>/g, "- $1");
  });
  input = input.replace(/<ol>(.*?)<\/ol>/gs, (match, group) => {
    return group.replace(/<li>(.*?)<\/li>/g, (match, item, index) => {
      return `${index + 1}. ${item}`;
    });
  });

  return input;
}

function cleanInput(input) {
  return input
    .replace(/style="[^"]*"/g, "")
    .replace(/class="(?!highlight|note)[^"]*"/g, "");
}

const markdownField = document.getElementById("markdownField");

markdownField.addEventListener("blur", () => {
  let inputContent = markdownField.innerText;
  let htmlContent = parseMarkdown(inputContent);

  markdownField.innerHTML = htmlContent;
  markdownField.contentEditable = true;
});

markdownField.addEventListener("focus", () => {
  let htmlContent = markdownField.innerHTML;
  let markdownContent = reverseMarkdown(htmlContent);

  markdownField.innerText = markdownContent;
});
markdownField.addEventListener("input", () => {
  sessionStorage.setItem("noteWidget-note", markdownField.innerHTML);
});

function loadMarkdowns() {
  let inputContent = markdownField.innerText;
  let htmlContent = parseMarkdown(inputContent);

  markdownField.innerHTML = htmlContent;
  markdownField.contentEditable = true;
}

loadMarkdowns();
