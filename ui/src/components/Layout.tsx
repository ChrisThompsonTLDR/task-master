import React, { Fragment, useState } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { NavLink, Link } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CogIcon,
  FolderIcon,
  BeakerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { GitCommit, Network, FileText, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Tree', href: '/tree', icon: Network },
  { name: 'Research', href: '/research', icon: BeakerIcon },
  { name: 'PRDs', href: '/prds', icon: FileText },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Config Explorer', href: '/config-explorer', icon: Settings },
  { name: 'Configuration', href: '/configuration', icon: CogIcon },
  { name: 'Task Files', href: '/task-files', icon: FolderIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function ThemeSwitcher() {
  const { setting, setTheme } = useTheme();

  const options = [
    { name: 'Light', value: 'light', icon: SunIcon },
    { name: 'Dark', value: 'dark', icon: MoonIcon },
    { name: 'System', value: 'system', icon: ComputerDesktopIcon },
  ];

  const currentOption = options.find(o => o.value === setting);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 rounded-full text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center justify-center">
        <span className="sr-only">Open theme options</span>
        {currentOption && <currentOption.icon className="h-5 w-5" />}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-full mb-2 right-0 w-36 origin-bottom-right rounded-md bg-zinc-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[99999]">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                    className={classNames(
                      'w-full text-left flex items-center gap-x-2 px-4 py-2 text-sm',
                      active ? 'bg-zinc-600 text-white' : 'text-zinc-200',
                      setting === option.value && 'font-bold text-orange-400'
                    )}
                  >
                    <option.icon className="h-5 w-5" />
                    {option.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { colorTheme } = useTheme();

  // Dynamic active classes based on the selected theme
  const activeClasses = {
    orange: 'bg-orange-600 text-white',
    blue: 'bg-blue-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    purple: 'bg-purple-600 text-white',
    rose: 'bg-rose-600 text-white',
    amber: 'bg-amber-600 text-white',
    cyan: 'bg-cyan-600 text-white',
    red: 'bg-red-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    teal: 'bg-teal-600 text-white',
    lime: 'bg-lime-600 text-white',
    pink: 'bg-pink-600 text-white',
    slate: 'bg-slate-600 text-white',
    zinc: 'bg-zinc-600 text-white',
    stone: 'bg-stone-600 text-white',
    neutral: 'bg-neutral-600 text-white'
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = 'group flex items-center px-2 py-2 text-sm font-medium rounded-md';
    const activeClass = isActive ? activeClasses[colorTheme] : 'text-zinc-300 hover:bg-zinc-700 hover:text-white';
    
    return classNames(baseClasses, activeClass);
  };

  const colorMap: { [key: string]: string } = {
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    purple: 'text-purple-500',
    rose: 'text-rose-500',
    amber: 'text-amber-500',
    cyan: 'text-cyan-500',
    red: 'text-red-500',
    indigo: 'text-indigo-500',
    teal: 'text-teal-500',
    lime: 'text-lime-500',
    pink: 'text-pink-500',
    slate: 'text-slate-500',
    zinc: 'text-zinc-500',
    stone: 'text-stone-500',
    neutral: 'text-neutral-500',
  };

  const sidebarContent = (
    <div className={`flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-800 ${sidebarCollapsed ? 'px-2' : 'px-6'} pb-4 transition-all duration-300`}>
      <div className="h-16 shrink-0">
        <Link to="/" className="flex items-center justify-center gap-x-2 pt-5">
          <GitCommit className={`h-8 w-8 ${colorMap[colorTheme] || 'text-neutral-500'}`} />
          {!sidebarCollapsed && <span className="text-white font-bold text-lg">TaskMonster</span>}
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink to={item.href} className={navLinkClasses} title={sidebarCollapsed ? item.name : undefined}>
                    <item.icon
                      className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 shrink-0`}
                      aria-hidden="true"
                    />
                    {!sidebarCollapsed && item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <div className="flex flex-col items-center space-y-2">
              <ThemeSwitcher />
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-full text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center justify-center"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-zinc-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {sidebarContent}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-72'} transition-all duration-300`}>
          {sidebarContent}
        </div>

        <div className={`${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'} transition-all duration-300`}>
          {/* Mobile header with menu button */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
            <button type="button" className="-m-2.5 p-2.5 text-zinc-700 dark:text-zinc-200" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
