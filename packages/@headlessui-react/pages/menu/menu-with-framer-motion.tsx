import * as React from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from '../../src/components/menu/menu'

import { classNames } from '../../src/utils/class-names'
import { PropsOf } from '../../src/types'

export default function Home() {
  return (
    <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                <span>Options</span>
                <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Menu.Button>

              <AnimatePresence>
                {open && (
                  <Menu.Items
                    static
                    as={motion.div}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: '0.5rem' }}
                    exit={{ opacity: 0, y: 0 }}
                    className="absolute right-0 w-56 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none opacity-0"
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm leading-5">Signed in as</p>
                      <p className="text-sm font-medium leading-5 text-gray-900 truncate">
                        tom@example.com
                      </p>
                    </div>

                    <div className="py-1">
                      <Item href="#account-settings">Account settings</Item>
                      <Item as={NextLink} href="#support">
                        Support
                      </Item>
                      <Item href="#new-feature" disabled>
                        New feature (soon)
                      </Item>
                      <Item href="#license">License</Item>
                    </div>

                    <div className="py-1">
                      <Item as={SignOutButton} />
                    </div>
                  </Menu.Items>
                )}
              </AnimatePresence>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}

function NextLink(props: PropsOf<'a'>) {
  const { href, children, ...rest } = props
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  )
}

function SignOutButton(props) {
  return (
    <form
      method="POST"
      action="#"
      onSubmit={e => {
        e.preventDefault()
        alert('SIGNED OUT')
      }}
      className="w-full"
    >
      <button type="submit" {...props}>
        Sign out
      </button>
    </form>
  )
}

function Item(props: PropsOf<typeof Menu.Item>) {
  return (
    <Menu.Item
      as="a"
      className={({ active, disabled }) =>
        classNames(
          'block w-full text-left px-4 py-2 text-sm leading-5 text-gray-700',
          active && 'bg-gray-100 text-gray-900',
          disabled && 'cursor-not-allowed opacity-50'
        )
      }
      {...props}
    />
  )
}
