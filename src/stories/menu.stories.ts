import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { MenuComponent } from '../app/components/menu/menu.component';
import { provideRouter } from '@angular/router';
import { routes } from '../app/app.routes';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<MenuComponent> = {
  title: 'Components/Menu',
  component: MenuComponent,
  tags: ['autodocs'],
  argTypes: {
  },
  decorators: [
    applicationConfig({
      providers: [provideRouter(routes)]
    })
  ]
};

export default meta;
type Story = StoryObj<MenuComponent>;

export const Primary: Story = {
  args: {
    model: [
      {
        items: [
          {
            label: 'Quickstart',
            icon: ['fas', 'coffee'],
            link: '/quickstart',
          },
          {
            label: 'About',
            icon: ['fas', 'circle-info'],
            link: '/about',
          },
          {
            label: 'Documentation',
            icon: ['fas', 'book'],
            items: [
              {
                label: 'API Documentation',
                icon: [],
                link: '',
              },
              {
                label: 'User Guide',
                icon: [],
                link: '',
              }
            ]
          }
        ],
      },
      {
        items: [
          {
            label: 'Sign Out',
            icon: ['fas', 'right-from-bracket'],
            link: '/sign-out',
          }
        ]
      }
    ]
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="justify-center align-center flex-group">
        <div class="bg-medium p-3 corner-2">
          <app-menu [model]="model"></app-menu>
        </div>  
      </div>
    `
  })
};
