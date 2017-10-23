import { Routes, RouterModule } from '@angular/router';
import { MainPageComponent } from './main-page.component';

const MainPage_Router: Routes = [
    {
        path: '', component: MainPageComponent, children: [
            //localhost:4200/main
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            //localhost:4200/main/home
            { path: 'home', loadChildren: './home-page/home-page.module#HomePageModule' },
            // localhost:4200/main/admin
            { path: 'admin', loadChildren: './admin-page/admin-page.module#AdminPageModule' },
            // localhost:4200/main/profile
            { path: 'profile', loadChildren: './profile-page/profile-page.module#ProfilePageModule' },
            // { path: 'function', loadChildren: './function/function.module#FunctionModule' },

            // { path: 'product-category', loadChildren: './product-category/product-category.module#ProductCategoryModule' },

            // { path: 'product', loadChildren: './product/product.module#ProductModule' },

            // { path: 'order', loadChildren: './order/order.module#OrderModule' },

            // { path: 'announcement', loadChildren: './announcement/announcement.module#AnnouncementModule' },

            // { path: 'report', loadChildren: './report/report.module#ReportModule' },

        ]
        // path : '' , component : MainPageComponent
    }
]

export const MainPageRouter = RouterModule.forChild(MainPage_Router);