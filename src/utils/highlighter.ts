import { createJavaScriptRegexEngine } from 'react-shiki';
import { createHighlighterCoreSync } from '@shikijs/core';
import type { Theme } from 'react-shiki';

import langJson from '@shikijs/langs/json';
import langCss from '@shikijs/langs/css';
import langSh from '@shikijs/langs/sh';
import langPowershell from '@shikijs/langs/powershell';
import langRust from '@shikijs/langs/rust';
import langTs from '@shikijs/langs/ts';
import langTsx from '@shikijs/langs/tsx';

/**
 * "Ossido" syntax theme — Catppuccin Mocha token colours (mauve keywords, blue
 * functions/tags, yellow types, green strings, peach numbers) on the site's
 * near-black obsidian background.
 */
export const ossidoDark: Theme = {
  name: 'ossido-mocha',
  type: 'dark',
  colors: {
    'editor.background': 'transparent',
    'editor.foreground': '#cdd6f4',
    'editor.selectionBackground': '#585b7066',
    'editorLineNumber.foreground': '#45475a',
  },
  settings: [
    { settings: { background: 'transparent', foreground: '#cdd6f4' } },

    // Comments — overlay grey, italic.
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: '#6c7086', fontStyle: 'italic' },
    },

    // Keywords / storage / control — mauve.
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.other',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.operator.new',
        'keyword.operator.expression',
      ],
      settings: { foreground: '#cba6f7' },
    },

    // this / self — red, italic.
    {
      scope: ['variable.language.this', 'variable.language.self', 'keyword.other.self'],
      settings: { foreground: '#f38ba8', fontStyle: 'italic' },
    },

    // Functions / methods / macros / commands — blue.
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call',
        'meta.function-call.generic',
        'entity.name.function.macro',
        'support.function.macro',
        'entity.name.command',
      ],
      settings: { foreground: '#89b4fa' },
    },

    // Types / classes / namespaces — yellow.
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'support.type',
        'support.class',
        'storage.type.primitive',
        'support.type.primitive',
      ],
      settings: { foreground: '#f9e2af' },
    },

    // Strings — green.
    {
      scope: ['string', 'string.quoted', 'string.template', 'meta.attribute-selector'],
      settings: { foreground: '#a6e3a1' },
    },
    // String escapes / template holes — pink.
    {
      scope: [
        'constant.character.escape',
        'punctuation.definition.template-expression',
        'punctuation.section.embedded',
      ],
      settings: { foreground: '#f5c2e7' },
    },

    // Numbers / constants / lifetimes — peach.
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.language.boolean',
        'support.constant',
        'constant.other.lifetime',
        'storage.modifier.lifetime',
      ],
      settings: { foreground: '#fab387' },
    },

    // Variables — text.
    {
      scope: ['variable', 'variable.other', 'meta.definition.variable', 'meta.variable'],
      settings: { foreground: '#cdd6f4' },
    },
    // Parameters — maroon.
    { scope: ['variable.parameter'], settings: { foreground: '#eba0ac' } },
    // Properties / object keys — text.
    {
      scope: ['variable.other.property', 'meta.object-literal.key', 'support.variable.property'],
      settings: { foreground: '#cdd6f4' },
    },

    // Operators — sky.
    { scope: ['keyword.operator'], settings: { foreground: '#89dceb' } },
    // Punctuation / braces — overlay.
    {
      scope: ['punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator'],
      settings: { foreground: '#9399b2' },
    },

    // JSX / TSX — tag names blue, namespaced/component tags and attributes yellow.
    { scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: '#89b4fa' } },
    { scope: ['entity.name.tag.namespace', 'meta.tag.other'], settings: { foreground: '#f9e2af' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#f9e2af' } },
  ],
};

export const highlighter = createHighlighterCoreSync({
  themes: [ossidoDark],
  langs: [langCss, langSh, langPowershell, langRust, langTs, langTsx, langJson],
  engine: createJavaScriptRegexEngine(),
});