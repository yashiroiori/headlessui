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

          <Transition
            show={isOpen}
            unmount={false}
            enter="transition ease-out duration-300"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition ease-in duration-300"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
            className="p-4 bg-white rounded-md shadow"
          >
            Contents to show and hide
          </Transition>
        </div>
      </div>
    </>
  )
}
