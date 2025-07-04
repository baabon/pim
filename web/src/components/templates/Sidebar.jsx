import { useUser, ROLES } from '../../auth/contexts/UserContext'
import { useState } from 'react'

export default function Sidebar({ isOpen, setActiveView }) {
  const { user, logout } = useUser()
  const [pimHovered, setPimHovered] = useState(false)

  return (
    <aside className={isOpen ? 'sidebar open' : 'sidebar closed'}>
      <ul>
        <li 
          className="icon-cube sidebar-item pim-item"
          onMouseEnter={() => setPimHovered(true)} 
          onMouseLeave={() => setPimHovered(false)}
          onClick={() => setActiveView('home')}
        >
          <svg fill="#828282" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" stroke="#828282"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M229.92236,70.81226c-.0249-.04541-.04345-.09229-.06933-.13746-.01123-.01953-.02442-.03662-.03565-.0559a15.989,15.989,0,0,0-5.97314-5.8855l-88-49.5a16.09272,16.09272,0,0,0-15.68848,0l-88,49.5A15.99092,15.99092,0,0,0,26.168,70.64575c-.01563.0271-.03369.05127-.04883.07862-.02441.0437-.042.08886-.06543.13256A15.98294,15.98294,0,0,0,24,78.67871v98.64258a16.02048,16.02048,0,0,0,8.15576,13.94531l88.00049,49.5a15.97122,15.97122,0,0,0,7.24463,2.02222c.17871.01343.35693.03052.53906.032.02393.00049.04785.00049.07178.00049.25146,0,.499-.01465.74463-.03735a15.97135,15.97135,0,0,0,7.08789-2.01734l88-49.5A16.02048,16.02048,0,0,0,232,177.32129V78.67871A15.98584,15.98584,0,0,0,229.92236,70.81226ZM128.91016,118.821,48.37891,73.96558,128,29.17871l79.74365,44.856ZM216,177.32129l-79.87891,44.93188.78711-89.57421L216,87.74561Z"></path> </g></svg>
          <label>PIM</label>

          {/* Submenú que aparece al hacer hover */}
          {pimHovered && (
            <ul className="submenu">
              {user?.role === ROLES.ADMINISTRATOR && (<li onClick={(e) => {e.stopPropagation(); setActiveView('pim-view')}}>Dashboard</li>)}
              <li onClick={(e) => {e.stopPropagation(); setActiveView('products')}}>Productos</li>
              <li onClick={(e) => {e.stopPropagation(); setActiveView('pim-view')}}>Creación Simple</li>
              <li onClick={(e) => {e.stopPropagation(); setActiveView('pim-view')}}>Creación Masiva</li>
              <li onClick={(e) => {e.stopPropagation(); setActiveView('pim-view')}}>Actualización Masiva</li>
              {user?.role === ROLES.ADMINISTRATOR && (<li onClick={(e) => {e.stopPropagation(); setActiveView('pim-view')}}>Publicación Masiva</li>)}
              {user?.role === ROLES.ADMINISTRATOR && (<li onClick={(e) => {e.stopPropagation(); setActiveView('pim-view')}}>Despublicación Masiva</li>)}
            </ul>
          )}
        </li>

        {user?.role === ROLES.ADMINISTRATOR && (
        <li className="icon-license" onClick={() => setActiveView('users')}>
          <svg fill="#828282" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 46.676 46.675" xmlSpace="preserve" stroke="#828282"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M42.176,6.318H4.5c-2.484,0-4.5,2.015-4.5,4.5v25.04c0,2.485,2.016,4.5,4.5,4.5h37.676c2.485,0,4.5-2.015,4.5-4.5v-25.04 C46.676,8.333,44.661,6.318,42.176,6.318z M4.486,29.095c0-0.053,0.012-0.104,0.014-0.153c0.072-2.192,1.646-3.981,4.121-4.953 c-0.863-1.026-1.383-2.348-1.383-3.79c0-1.643,0.676-3.129,1.762-4.2c0.254-0.25,0.529-0.479,0.824-0.681 c0.947-0.646,2.089-1.022,3.318-1.022s2.37,0.378,3.316,1.022c1.561,1.063,2.587,2.854,2.587,4.881 c0,1.441-0.521,2.763-1.383,3.789c2.375,0.932,3.93,2.613,4.114,4.688c0.019,0.138,0.025,0.279,0.025,0.42 c0,0.882-0.352,1.677-0.917,2.265c-0.595,0.617-1.427,1.006-2.353,1.006c-0.002,0-0.004,0-0.008,0H7.754 c-1.76,0-3.184-1.394-3.256-3.133C4.498,29.186,4.486,29.143,4.486,29.095z M42.176,30.475c-0.07,1.04-0.929,1.864-1.986,1.864h-12 c-0.729,0-1.361-0.396-1.713-0.981c-0.178-0.299-0.287-0.646-0.287-1.019c0-1.104,0.896-2,2-2h9.486h2.514 c1.06,0,1.916,0.824,1.986,1.863c0.003,0.047,0.014,0.09,0.014,0.137S42.179,30.429,42.176,30.475z M42.176,23.474 c-0.07,1.039-0.929,1.863-1.986,1.863h-2.514h-9.486c-1.104,0-2-0.896-2-2c0-1.104,0.896-2,2-2h9.486h2.514 c1.06,0,1.916,0.824,1.986,1.864c0.003,0.046,0.014,0.089,0.014,0.135C42.189,23.384,42.179,23.427,42.176,23.474z M42.176,16.473 c-0.07,1.04-0.929,1.864-1.986,1.864h-2.514h-9.486c-1.104,0-2-0.896-2-2c0-0.374,0.109-0.72,0.287-1.019 c0.352-0.586,0.982-0.981,1.713-0.981h12c1.06,0,1.916,0.824,1.986,1.864c0.003,0.046,0.014,0.089,0.014,0.136 S42.179,16.427,42.176,16.473z"></path> </g> </g></svg>
          <label>Cuentas</label>
        </li>
        )}

        <li className="icon-trash">
          <svg fill="#828282" viewBox="-1 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m16.313 4v-1.813c0-.013 0-.028 0-.043 0-1.184-.96-2.144-2.144-2.144-.003 0-.006 0-.01 0h-6.32c-.002 0-.005 0-.008 0-1.183 0-2.142.959-2.142 2.142 0 .016 0 .031.001.047v-.002 1.813h-5.69v2h.575c.196.023.372.099.515.214l-.002-.002c.119.157.203.346.239.552l.001.008 1.187 15.106c.094 1.84.094 2.118 2.25 2.118h12.462c2.16 0 2.16-.275 2.25-2.113l1.187-15.1c.036-.217.12-.409.242-.572l-.002.003c.141-.113.316-.19.508-.212h.005.575v-2h-5.687zm-9.313-1.813c0-.6.487-.938 1.106-.938h5.734c.618 0 1.162.344 1.162.938v1.813h-8zm-.531 17.813-.64-12h1.269l.656 12zm5.225 0h-1.374v-12h1.375zm3.85 0h-1.275l.656-12h1.269z"></path></g></svg>
          <label>Papelera</label>
        </li>
      </ul>

      {user?.role === ROLES.ADMINISTRATOR && (
      <div className="settings">
        <svg fill="#828282" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 932.179 932.179" xmlSpace="preserve" stroke="#828282" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M61.2,341.538c4.9,16.8,11.7,33,20.3,48.2l-24.5,30.9c-8,10.1-7.1,24.5,1.9,33.6l42.2,42.2c9.1,9.1,23.5,9.899,33.6,1.899 l30.7-24.3c15.8,9.101,32.6,16.2,50.1,21.2l4.6,39.5c1.5,12.8,12.3,22.4,25.1,22.4h59.7c12.8,0,23.6-9.601,25.1-22.4l4.4-38.1 c18.8-4.9,36.8-12.2,53.7-21.7l29.7,23.5c10.1,8,24.5,7.1,33.6-1.9l42.2-42.2c9.1-9.1,9.9-23.5,1.9-33.6l-23.1-29.3 c9.6-16.601,17.1-34.3,22.1-52.8l35.6-4.1c12.801-1.5,22.4-12.3,22.4-25.1v-59.7c0-12.8-9.6-23.6-22.4-25.1l-35.1-4.1 c-4.801-18.3-12-35.8-21.199-52.2l21.6-27.3c8-10.1,7.1-24.5-1.9-33.6l-42.1-42.1c-9.1-9.1-23.5-9.9-33.6-1.9l-26.5,21 c-17.2-10.1-35.601-17.8-54.9-23l-4-34.3c-1.5-12.8-12.3-22.4-25.1-22.4h-59.7c-12.8,0-23.6,9.6-25.1,22.4l-4,34.3 c-19.8,5.3-38.7,13.3-56.3,23.8l-27.5-21.8c-10.1-8-24.5-7.1-33.6,1.9l-42.2,42.2c-9.1,9.1-9.9,23.5-1.9,33.6l23,29.1 c-9.2,16.6-16.2,34.3-20.8,52.7l-36.8,4.2c-12.8,1.5-22.4,12.3-22.4,25.1v59.7c0,12.8,9.6,23.6,22.4,25.1L61.2,341.538z M277.5,180.038c54.4,0,98.7,44.3,98.7,98.7s-44.3,98.7-98.7,98.7c-54.399,0-98.7-44.3-98.7-98.7S223.1,180.038,277.5,180.038z"></path> <path d="M867.699,356.238l-31.5-26.6c-9.699-8.2-24-7.8-33.199,0.9l-17.4,16.3c-14.699-7.1-30.299-12.1-46.4-15l-4.898-24 c-2.5-12.4-14-21-26.602-20l-41.1,3.5c-12.6,1.1-22.5,11.4-22.9,24.1l-0.799,24.4c-15.801,5.7-30.701,13.5-44.301,23.3 l-20.799-13.8c-10.602-7-24.701-5-32.9,4.7l-26.6,31.7c-8.201,9.7-7.801,24,0.898,33.2l18.201,19.399 c-6.301,14.2-10.801,29.101-13.4,44.4l-26,5.3c-12.4,2.5-21,14-20,26.601l3.5,41.1c1.1,12.6,11.4,22.5,24.1,22.9l28.1,0.899 c5.102,13.4,11.801,26.101,19.9,38l-15.699,23.7c-7,10.6-5,24.7,4.699,32.9l31.5,26.6c9.701,8.2,24,7.8,33.201-0.9l20.6-19.3 c13.5,6.3,27.699,11,42.299,13.8l5.701,28.2c2.5,12.4,14,21,26.6,20l41.1-3.5c12.6-1.1,22.5-11.399,22.9-24.1l0.9-27.601 c15-5.3,29.199-12.5,42.299-21.399l22.701,15c10.6,7,24.699,5,32.9-4.7l26.6-31.5c8.199-9.7,7.799-24-0.9-33.2l-18.301-19.399 c6.701-14.2,11.602-29.2,14.4-44.601l25-5.1c12.4-2.5,21-14,20-26.601l-3.5-41.1c-1.1-12.6-11.4-22.5-24.1-22.9l-25.1-0.8 c-5.201-14.6-12.201-28.399-20.9-41.2l13.699-20.6C879.4,378.638,877.4,364.438,867.699,356.238z M712.801,593.837 c-44.4,3.801-83.602-29.3-87.301-73.699c-3.801-44.4,29.301-83.601,73.699-87.301c44.4-3.8,83.602,29.301,87.301,73.7 C790.301,550.938,757.199,590.138,712.801,593.837z"></path> <path d="M205,704.438c-12.6,1.3-22.3,11.899-22.4,24.6l-0.3,25.3c-0.2,12.7,9.2,23.5,21.8,25.101l18.6,2.399 c3.1,11.301,7.5,22.101,13.2,32.301l-12,14.8c-8,9.899-7.4,24.1,1.5,33.2l17.7,18.1c8.9,9.1,23.1,10.1,33.2,2.3l14.899-11.5 c10.5,6.2,21.601,11.101,33.2,14.5l2,19.2c1.3,12.6,11.9,22.3,24.6,22.4l25.301,0.3c12.699,0.2,23.5-9.2,25.1-21.8l2.3-18.2 c12.601-3.101,24.601-7.8,36-14l14,11.3c9.9,8,24.101,7.4,33.201-1.5l18.1-17.7c9.1-8.899,10.1-23.1,2.301-33.2L496.6,818.438 c6.6-11,11.701-22.7,15.201-35l16.6-1.7c12.6-1.3,22.299-11.9,22.4-24.6l0.299-25.301c0.201-12.699-9.199-23.5-21.799-25.1 l-16.201-2.1c-3.1-12.2-7.699-24-13.699-35l10.1-12.4c8-9.9,7.4-24.1-1.5-33.2l-17.699-18.1c-8.9-9.101-23.102-10.101-33.201-2.3 l-12.101,9.3c-11.399-6.9-23.6-12.2-36.399-15.8l-1.601-15.7c-1.3-12.601-11.899-22.3-24.6-22.4l-25.3-0.3 c-12.7-0.2-23.5,9.2-25.101,21.8l-2,15.601c-13.199,3.399-25.899,8.6-37.699,15.399l-12.5-10.2c-9.9-8-24.101-7.399-33.201,1.5 l-18.2,17.801c-9.1,8.899-10.1,23.1-2.3,33.199l10.7,13.801c-6.2,11-11.1,22.699-14.3,35L205,704.438z M368.3,675.837 c36.3,0.4,65.399,30.301,65,66.601c-0.4,36.3-30.301,65.399-66.601,65c-36.3-0.4-65.399-30.3-65-66.601 C302.1,704.538,332,675.438,368.3,675.837z"></path> </g> </g></svg>
        <label>Ajustes</label>
      </div>
      )}
    </aside>
  )
}

