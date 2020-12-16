import React, { useState } from 'react'
import { Transition } from '@headlessui/react'

export default function Home() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
        <div className="space-y-2 w-96">
          <span className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setIsOpen(v => !v)}
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
            >
              {isOpen ? 'Hide' : 'Show'}
            </button>
          </span>

          <Transition show={isOpen} unmount={false}>
            <Box>
              <Box>
                <Box>
                  <Box />
                </Box>
                <Box>
                  <Box>
                    <Box>
                      <Box />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Transition>
        </div>
      </div>
    </>
  )
}

function Box({ children }: { children?: React.ReactNode }) {
  return (
    <Transition.Child
      unmount={false}
      enter="transition translate duration-300"
      enterFrom="transform -translate-x-full"
      enterTo="transform translate-x-0"
      leave="transition translate duration-300"
      leaveFrom="transform translate-x-0"
      leaveTo="transform translate-x-full"
    >
      <div className="p-4 space-y-2 text-sm font-semibold tracking-wide text-gray-700 uppercase bg-white rounded-md shadow">
        <span>This is a box</span>
        {children}
      </div>
    </Transition.Child>
  )
}
