import { moduleMetadata, type Preview } from '@storybook/angular'
import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";
setCompodocJson(docJson);


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#faf9fd'},
        { name: 'dark', value: '#121316'}
      ],
    }
  },
  decorators: [
    (storyFn, context) => {
      const themeClass = context.globals['backgrounds']?.value === '#faf9fd' ? 'light' : 'dark';
      document.body.style.colorScheme  = themeClass;
      document.body.style.background = 'var(--mat-sys-background) !important';

      return storyFn();
    }
  ]
};

export default preview;