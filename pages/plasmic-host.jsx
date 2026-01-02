import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
import { PLASMIC } from '@/plasmic-init';
import AlertBox from '../components/AlertBox';
import PrizeScratchCard from '../components/PrizeScratchCard';
import QuizFlow from '../components/QuizFlow';

// ✅ Register WITHOUT meta.importPath
PLASMIC.registerComponent(AlertBox, {
  name: 'AlertBox',
  props: {
    message: {
      type: 'string',
      defaultValue: 'Alert message',
    },
    type: {
      type: 'choice',
      options: ['success', 'warning', 'error'],
      defaultValue: 'success',
    },
  },
});

PLASMIC.registerComponent(PrizeScratchCard, {
  name: 'Prize Scratch Card',
  props: {
    width: { type: 'number', defaultValue: 300 },
    height: { type: 'number', defaultValue: 300 },

    prizeImage: { type: 'imageUrl' },
    coverColor: { type: 'color', defaultValue: '#B0B0B0' },
    scratchThreshold: { type: 'number', defaultValue: 60 },

    popupTitle: { type: 'string', defaultValue: '🎉 Congratulations!' },
    popupMessage: { type: 'string', defaultValue: 'You won a prize!' },

    buttonText: { type: 'string', defaultValue: 'Claim Now' },
    buttonLink: { type: 'href' },

    buttonBgColor: { type: 'color', defaultValue: '#28a745' },
    buttonTextColor: { type: 'color', defaultValue: '#ffffff' },
    popupBgColor: { type: 'color', defaultValue: '#ffffff' },

    showClose: { type: 'boolean', defaultValue: true },
  },
});

PLASMIC.registerComponent(QuizFlow, {
  name: 'QuizFlow',
  props: {
    questionColor: {
      type: 'color',
      defaultValue: '#ffffff',
    },
    questionFontSize: {
      type: 'number',
      defaultValue: 36,
    },

    optionColor: {
      type: 'color',
      defaultValue: '#ffffff',
    },
    optionFontSize: {
      type: 'number',
      defaultValue: 18,
    },

    correctColor: {
      type: 'color',
      defaultValue: 'green',
    },
    incorrectColor: {
      type: 'color',
      defaultValue: 'red',
    },

    buttonText: {
      type: 'string',
      defaultValue: 'Next',
    },
    buttonBg: {
      type: 'color',
      defaultValue: '#0b4a8b',
    },
    buttonColor: {
      type: 'color',
      defaultValue: '#ffffff',
    },
  },
});



export default function PlasmicHost() {
  return <PlasmicCanvasHost />;
}
