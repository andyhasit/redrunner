import {Component} from 'redrunner'

export const Navbar = Component.__ex__(html`
  <nav>
    <h3>RedRunner</h3>
    <use:Menu :props="p"/>
  </nav>
`)

const Menu = Component.__ex__(html`
  <div class="menu">
    <div :use="MenuEntry" :items="*|p"></div>
  </div>
`)

const MenuEntry = Component.__ex__(html`
  <div class="menu-entry">
    <a href="#{..path}">{..name}</a>
  </div>
`)
