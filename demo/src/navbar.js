import {View} from 'redrunner'

const menuVisible = false

export const Navbar = View.__ex__(html`
  <nav>
    <h3>RedRunner Demo</h3>
    <use:Menu :props="p"/>
  </nav>
`)

export const Menu = View.__ex__(html`
  <div class="menu"">
    <div :items="p|MenuEntry"></div>
  </div>
`)

const MenuEntry = View.__ex__(html`
  <div class="menu-entry">
    <a href="#{..path}">{..name}</a>
  </div>
`)
