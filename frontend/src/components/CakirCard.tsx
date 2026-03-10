import React from 'react'

type Props = {
  name?: string
  role?: string
  imageUrl?: string
  description?: string
}

export default function CakirCard({
  name = 'Huzeyfe Çakir',
  role = 'Fullstack Developer',
  imageUrl = '/src/assets/react.svg',
  description = "Brève présentation — compétences, intérêts ou extrait du profil.",
}: Props) {
  return (
    <article className="max-w-md w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-lg p-5 flex gap-4 items-start">
      <img
        src={imageUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover flex-none ring-2 ring-offset-2 ring-indigo-300"
      />

      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">{role}</p>
          </div>
          <div className="text-sm text-slate-400">• 3 min</div>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{description}</p>

        <div className="mt-4 flex gap-2">
          <button className="px-3 py-1 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700">Message</button>
          <button className="px-3 py-1 rounded-md text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100">Profile</button>
        </div>
      </div>
    </article>
  )
}
