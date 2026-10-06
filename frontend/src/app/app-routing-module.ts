import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdministrarCuentasComponent } from './pages/administrar-cuentas/administrar-cuentas.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { NuevaVentaComponent } from './pages/nueva-venta/nueva-venta.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { NuevaCompraComponent } from './pages/nueva-compra/nueva-compra.component';
import { InventarioComponent } from './pages/inventario/inventario.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'cuentas', component: AdministrarCuentasComponent },
      {
        path: 'ventas',
        children: [
          { path: '', component: VentasComponent },
          { path: 'nueva', component: NuevaVentaComponent },
        ],
      },
      {
        path: 'compras',
        children: [
          { path: '', component: ComprasComponent },
          { path: 'nueva', component: NuevaCompraComponent },
        ],
      },
      { path: 'inventario', component: InventarioComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
