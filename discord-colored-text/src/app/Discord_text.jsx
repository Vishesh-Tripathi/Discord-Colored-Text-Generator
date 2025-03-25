'use client';
import { useState, useRef, useMemo } from 'react';
import { Container, Title, Text, Button, Group, SimpleGrid, Center, Divider } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconEraser } from '@tabler/icons-react';
import ContentEditable from 'react-contenteditable';
import GraphemeSplitter from 'grapheme-splitter';

// ANSI color codes for Discord
const ANSI_COLORS = {
  FG: {
    '#ff5555': '\u001b[31m',
    '#55ff55': '\u001b[32m',
    '#5555ff': '\u001b[34m',
    '#ff55ff': '\u001b[35m',
    '#ffffff': '\u001b[37m',
    '#ffff55': '\u001b[33m',
    '#55ffff': '\u001b[36m',
    '#ffaa00': '\u001b[38;2;255;170;0m',
    '#aaaaaa': '\u001b[90m',
    '#ff00ff': '\u001b[95m',
  },
  BG: {
    '#ff0000': '\u001b[41m',
    '#00ff00': '\u001b[42m',
    '#0000ff': '\u001b[44m',
    '#800080': '\u001b[45m',
    '#000000': '\u001b[40m',
    '#ffff00': '\u001b[43m',
    '#00ffff': '\u001b[46m',
    '#ffaa00': '\u001b[48;2;255;170;0m',
    '#666666': '\u001b[100m',
    '#ff00ff': '\u001b[105m',
  },
  RESET: '\u001b[0m',
};

// Color options for FG and BG
const fgColors = [
  { color: '#ff5555', label: 'Red' },
  { color: '#55ff55', label: 'Green' },
  { color: '#5555ff', label: 'Blue' },
  { color: '#ff55ff', label: 'Purple' },
  { color: '#ffffff', label: 'White' },
  { color: '#ffff55', label: 'Yellow' },
  { color: '#55ffff', label: 'Cyan' },
  { color: '#ffaa00', label: 'Orange' },
  { color: '#aaaaaa', label: 'Gray' },
  { color: '#ff00ff', label: 'Magenta' },
];

const bgColors = [
  { color: '#ff0000', label: 'Red' },
  { color: '#00ff00', label: 'Green' },
  { color: '#0000ff', label: 'Blue' },
  { color: '#800080', label: 'Purple' },
  { color: '#000000', label: 'Black' },
  { color: '#ffff00', label: 'Yellow' },
  { color: '#00ffff', label: 'Cyan' },
  { color: '#ffaa00', label: 'Orange' },
  { color: '#666666', label: 'Gray' },
  { color: '#ff00ff', label: 'Magenta' },
];

// Component to render color grid
const ColorGrid = ({ colors, type, applyColor, currentColor }) => (
  <div>
    <Text className="text-center mb-2 text-white">{type}</Text>
    <SimpleGrid cols={5} spacing="xs">
      {colors.map((color) => (
        <Button
          key={color.label}
          onClick={() => applyColor(color.color, type)}
          className={`w-10 h-10 border-2 border-border-gray hover:border-green-accent ${
            color.color === currentColor ? 'active-color' : ''
          }`}
          style={{ backgroundColor: color.color }}
        />
      ))}
    </SimpleGrid>
  </div>
);

export default function Home() {
    const splitter = new GraphemeSplitter();
  const initialText = "Welcome to Vishesh's Discord Colored Text Generator! hey 👋";
  const graphemes = splitter.splitGraphemes(initialText); // Split into graphemes
  const [text, setText] = useState(initialText);
  const [charStyles, setCharStyles] = useState(() => {
    const styles = Array(graphemes.length).fill(null).map(() => ({
      fg: '#ffffff',
      bg: '#1a1b1e',
      bold: false,
      underline: false,
    }));

    // Welcome (grapheme indices 0–6): Red
    for (let i = 0; i <= 6; i++) {
      styles[i].fg = '#ff5555';
    }

    // to (grapheme indices 7–10): Green
    for (let i = 7; i <= 10; i++) {
      styles[i].fg = '#55ff55';
    }

    // Vishesh's (grapheme indices 11–19): Blue, Bold
    for (let i = 11; i <= 19; i++) {
      styles[i].fg = '#5555ff';
      styles[i].bold = true;
    }

    // Discord (grapheme indices 20–27): Purple
    for (let i = 20; i <= 27; i++) {
      styles[i].fg = '#ff55ff';
    }

    // Colored (grapheme indices 28–35): Yellow, Underlined
    for (let i = 28; i <= 35; i++) {
      styles[i].fg = '#ffff55';
      styles[i].underline = true;
    }

    // Text (grapheme indices 36–40): Cyan
    for (let i = 36; i <= 40; i++) {
      styles[i].fg = '#55ffff';
    }

    // Generator! (grapheme indices 41–51): Orange
    for (let i = 41; i <= 51; i++) {
      styles[i].fg = '#ffaa00';
    }

    // hey (grapheme indices 52–55): Gray
    for (let i = 52; i <= 55; i++) {
      styles[i].fg = '#aaaaaa';
    }

    // 👋 (grapheme index 56): Magenta
    styles[56].fg = '#ff00ff';

    return styles;
  });
  const [currentFgColor, setCurrentFgColor] = useState('#ffffff');
  const [currentBgColor, setCurrentBgColor] = useState('#1a1b1e');
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const contentEditableRef = useRef(null);
  const clipboard = useClipboard({ timeout: 500 });

  // Helper function to get character offsets from a DOM selection range
  const getCharacterOffsets = (range, contentEditableElement) => {
    let startOffset = 0;
    let endOffset = 0;
    let currentOffset = 0;
    let foundStart = false;

    const walkNodes = (node) => {
      if (node === range.startContainer) {
        startOffset = currentOffset + range.startOffset;
        foundStart = true;
      }
      if (node === range.endContainer) {
        endOffset = currentOffset + range.endOffset;
        return true;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        currentOffset += node.textContent.length;
      } else {
        for (let child of node.childNodes) {
          if (walkNodes(child)) break;
        }
      }
      return false;
    };

    walkNodes(contentEditableElement.current);
    return { startOffset, endOffset };
  };

  const applyColor = (color, type) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset } = getCharacterOffsets(range, contentEditableRef);
      if (startOffset !== endOffset) {
        const newCharStyles = [...charStyles];
        for (let i = startOffset; i < endOffset && i < newCharStyles.length; i++) {
          newCharStyles[i] = { ...newCharStyles[i], [type === 'FG' ? 'fg' : 'bg']: color };
        }
        setCharStyles(newCharStyles);
      }
    }
    if (type === 'FG') setCurrentFgColor(color);
    else if (type === 'BG') setCurrentBgColor(color);
  };

  const applyBold = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset } = getCharacterOffsets(range, contentEditableRef);
      if (startOffset !== endOffset) {
        const newCharStyles = [...charStyles];
        for (let i = startOffset; i < endOffset && i < newCharStyles.length; i++) {
          newCharStyles[i] = { ...newCharStyles[i], bold: !isBoldActive };
        }
        setCharStyles(newCharStyles);
      }
    }
    const newBoldState = !isBoldActive;
    setIsBoldActive(newBoldState);
    console.log(`Bold button is now ${newBoldState ? 'active' : 'inactive'}`);
  };

  const applyUnderline = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset } = getCharacterOffsets(range, contentEditableRef);
      if (startOffset !== endOffset) {
        const newCharStyles = [...charStyles];
        for (let i = startOffset; i < endOffset && i < newCharStyles.length; i++) {
          newCharStyles[i] = { ...newCharStyles[i], underline: !isUnderlineActive };
        }
        setCharStyles(newCharStyles);
      }
    }
    const newUnderlineState = !isUnderlineActive;
    setIsUnderlineActive(newUnderlineState);
    console.log(`Underline button is now ${newUnderlineState ? 'active' : 'inactive'}`);
  };

  const clearFormatting = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset } = getCharacterOffsets(range, contentEditableRef);
      if (startOffset !== endOffset) {
        const newCharStyles = [...charStyles];
        for (let i = startOffset; i < endOffset && i < newCharStyles.length; i++) {
          newCharStyles[i] = { fg: '#ffffff', bg: '#1a1b1e', bold: false, underline: false };
        }
        setCharStyles(newCharStyles);
        updateFormattingState();
      }
    }
    setCurrentFgColor('#ffffff');
    setCurrentBgColor('#1a1b1e');
    setIsBoldActive(false);
    setIsUnderlineActive(false);
    console.log('Bold button is now inactive due to clearFormatting');
    console.log('Underline button is now inactive due to clearFormatting');
  };

  const handleChange = (evt) => {
    const newText = evt.target.value.replace(/<[^>]+>/g, '') || '';
    const newCharStyles = Array(newText.length).fill(null);

    for (let i = 0; i < newText.length; i++) {
      newCharStyles[i] = i < charStyles.length
        ? charStyles[i]
        : { fg: currentFgColor, bg: currentBgColor, bold: isBoldActive, underline: isUnderlineActive };
    }

    setText(newText);
    setCharStyles(newCharStyles);
    updateFormattingState();
  };

  const resetText = () => {
    setText('');
    setCharStyles([]);
    setCurrentFgColor('#ffffff');
    setCurrentBgColor('#1a1b1e');
    setIsBoldActive(false);
    setIsUnderlineActive(false);
    console.log('Bold button is now inactive due to resetText');
    console.log('Underline button is now inactive due to resetText');
  };

  const updateFormattingState = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset } = getCharacterOffsets(range, contentEditableRef);
      if (startOffset !== endOffset) {
        const allBold = charStyles
          .slice(startOffset, endOffset)
          .every((style) => style?.bold === true);
        const newBoldState = allBold;
        setIsBoldActive(newBoldState);
        console.log(`Bold button updated to ${newBoldState ? 'active' : 'inactive'} due to selection`);

        const allUnderlined = charStyles
          .slice(startOffset, endOffset)
          .every((style) => style?.underline === true);
        const newUnderlineState = allUnderlined;
        setIsUnderlineActive(newUnderlineState);
        console.log(`Underline button updated to ${newUnderlineState ? 'active' : 'inactive'} due to selection`);
      }
    }
  };

  const copyText = () => {
    let ansiText = '';
    let lastFg = null;
    let lastBg = null;
    let boldActive = false;
    let underlineActive = false;

    for (let i = 0; i < text.length; i++) {
      const { fg, bg, bold, underline } = charStyles[i] || {
        fg: '#ffffff',
        bg: '#1a1b1e',
        bold: false,
        underline: false,
      };

      if (bold && !boldActive) {
        ansiText += '**';
        boldActive = true;
      } else if (!bold && boldActive) {
        ansiText += '**';
        boldActive = false;
      }

      if (underline && !underlineActive) {
        ansiText += '__';
        underlineActive = true;
      } else if (!underline && underlineActive) {
        ansiText += '__';
        underlineActive = false;
      }

      if (fg !== lastFg) {
        if (lastFg !== null) {
          ansiText += ANSI_COLORS.RESET;
          if (boldActive) ansiText += '**';
          if (underlineActive) ansiText += '__';
        }
        // Only add the foreground color code if it's not the default color (#ffffff)
        // or if there's other formatting active (bold, underline, or background)
        if (fg !== '#ffffff' || bold || underline || (bg !== '#1a1b1e' && bg !== lastBg)) {
          ansiText += ANSI_COLORS.FG[fg] || '';
        }
        lastFg = fg;
      }

      if (bg !== lastBg) {
        if (lastBg !== null) {
          ansiText += ANSI_COLORS.RESET;
          if (boldActive) ansiText += '**';
          if (underlineActive) ansiText += '__';
        }
        // Only add the background color code if it's not the default (#1a1b1e)
        if (bg !== '#1a1b1e') {
          ansiText += ANSI_COLORS.BG[bg] || '';
        }
        lastBg = bg;
      }

      ansiText += text[i];
    }

    if (boldActive) ansiText += '**';
    if (underlineActive) ansiText += '__';
    ansiText += ANSI_COLORS.RESET;

    // Wrap the ANSI text in a Discord code block with the 'ansi' language tag
    const discordFormattedText = "```ansi\n" + ansiText ;
    clipboard.copy(discordFormattedText);
  };

  const generateStyledHtml = () => {
    if (!text) return '';

    let html = '';
    let currentSpan = { fg: null, bg: null, bold: null, underline: null, text: '' };

    for (let i = 0; i < text.length; i++) {
      const style = charStyles[i] || { fg: '#ffffff', bg: '#1a1b1e', bold: false, underline: false };

      if (
        i === 0 ||
        style.fg !== currentSpan.fg ||
        style.bg !== currentSpan.bg ||
        style.bold !== currentSpan.bold ||
        style.underline !== currentSpan.underline
      ) {
        if (currentSpan.text) {
          html += `<span style="color: ${currentSpan.fg}; background-color: ${currentSpan.bg}; ${
            currentSpan.bold ? 'font-weight: bold;' : ''
          } ${currentSpan.underline ? 'text-decoration: underline;' : ''}">${currentSpan.text}</span>`;
        }
        currentSpan = { fg: style.fg, bg: style.bg, bold: style.bold, underline: style.underline, text: text[i] };
      } else {
        currentSpan.text += text[i];
      }
    }

    if (currentSpan.text) {
      html += `<span style="color: ${currentSpan.fg}; background-color: ${currentSpan.bg}; ${
        currentSpan.bold ? 'font-weight: bold;' : ''
      } ${currentSpan.underline ? 'text-decoration: underline;' : ''}">${currentSpan.text}</span>`;
    }

    return html;
  };

  const renderStyledText = useMemo(() => {
    if (!text || typeof text !== 'string') return <span className="text-white"> </span>;

    const spans = [];
    let currentSpan = { fg: null, bg: null, bold: null, underline: null, text: '', startIndex: 0 };

    for (let i = 0; i < text.length; i++) {
      const style = charStyles[i] || { fg: '#ffffff', bg: '#1a1b1e', bold: false, underline: false };

      if (
        i === 0 ||
        style.fg !== currentSpan.fg ||
        style.bg !== currentSpan.bg ||
        style.bold !== currentSpan.bold ||
        style.underline !== currentSpan.underline
      ) {
        if (currentSpan.text) {
          spans.push(
            <span
              key={currentSpan.startIndex}
              style={{
                color: currentSpan.fg,
                backgroundColor: currentSpan.bg,
              }}
              className={`${currentSpan.bold ? 'font-bold' : ''} ${currentSpan.underline ? 'underline' : ''}`}
            >
              {currentSpan.text}
            </span>
          );
        }
        currentSpan = { fg: style.fg, bg: style.bg, bold: style.bold, underline: style.underline, text: text[i], startIndex: i };
      } else {
        currentSpan.text += text[i];
      }
    }

    if (currentSpan.text) {
      spans.push(
        <span
          key={currentSpan.startIndex}
          style={{
            color: currentSpan.fg,
            backgroundColor: currentSpan.bg,
          }}
          className={`${currentSpan.bold ? 'font-bold' : ''} ${currentSpan.underline ? 'underline' : ''}`}
        >
          {currentSpan.text}
        </span>
      );
    }

    return spans;
  }, [text, charStyles]);

  return (
    <Container className="py-8 bg-dark-bg min-h-screen text-white">
      <Title className="text-center mb-8 text-green-accent text-4xl font-bold">
        Vishesh's Discord Colored Text Generator
      </Title>

      <div className="mb-12">
        <Title order={2} className="text-center mb-4 text-white">
          About
        </Title>
        <Text className="text-center text-text-gray leading-relaxed">
          This is a simple app that creates colored Discord messages using the ANSI color codes available on the latest Discord desktop versions.
          <br />
          To use this, write your text, select parts of it and assign colors to them, then copy it using the button below, and send in a Discord message.
        </Text>
      </div>

      <div className="mb-12">
        <Title order={2} className="text-center mb-6 text-white">
          Create Your Text
        </Title>

        <div className="flex justify-center mb-6">
          <Group position="center" spacing="xs">
            <Button
              onClick={resetText}
              className="border border-red-accent text-red-accent hover:bg-red-accent/20"
            >
              Reset All
            </Button>
            <Button
              onClick={applyBold}
              className={`border border-blue-accent text-blue-accent hover:bg-blue-accent/20 ${
                isBoldActive ? 'active-color' : ''
              }`}
            >
              Bold
            </Button>
            <Button
              onClick={applyUnderline}
              className={`border border-blue-accent text-blue-accent hover:bg-blue-accent/20 ${
                isUnderlineActive ? 'active-color' : ''
              }`}
            >
              Line
            </Button>
            <Button
              onClick={clearFormatting}
              className="border border-gray-accent text-gray-accent hover:bg-gray-accent/20"
            >
              <IconEraser size={12} className="mr-1" />
              Clear
            </Button>
          </Group>
        </div>

        <Group position="center" className=" sm:ml-56  mb-6">
          <ColorGrid
            colors={fgColors}
            type="FG"
            applyColor={applyColor}
            currentColor={currentFgColor}
          />
          <ColorGrid
            colors={bgColors}
            type="BG"
            applyColor={applyColor}
            currentColor={currentBgColor}
          />
        </Group>

        <div className="mb-6">
          <Text className="text-sm mb-2 text-text-gray">Edit Your Text</Text>
          <div className="bg-dark-bg border border-border-gray rounded p-3 min-h-[100px] whitespace-pre-wrap overflow-auto shadow custom-mono">
            <ContentEditable
              innerRef={contentEditableRef}
              html={generateStyledHtml()}
              onChange={handleChange}
              onMouseUp={updateFormattingState}
              onKeyUp={updateFormattingState}
              className="outline-none text-white text-base"
              spellCheck="true"
            />
          </div>
        </div>

        {/* <div className="mb-6">
          <Text className="text-sm mb-2 text-text-gray">Preview (How it will look in Discord)</Text>
          <div className="bg-dark-bg border border-border-gray rounded p-3 min-h-[100px] whitespace-pre-wrap overflow-auto shadow custom-mono">
            {renderStyledText}
          </div>
        </div> */}

        <Center>
          <Button
            onClick={copyText}
            className="bg-blue-accent hover:bg-blue-hover"
          >
            Copy text as Discord formatted
          </Button>
          {clipboard.copied && <Text className="ml-4 text-green-accent">Copied!</Text>}
        </Center>
      </div>

      <Divider className="my-6 border-border-gray" />

      <Text className="text-center text-sm text-text-dim italic">
        This is an unofficial tool, it is not created or endorsed by Discord.
      </Text>
    </Container>
  );
}