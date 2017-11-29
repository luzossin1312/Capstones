import { Routes, RouterModule } from '@angular/router';
import { ProfilePageComponent } from './profile-page.component';
import { OverviewInfoComponent } from './overview-info/overview-info.component';
import { CreatePostComponent } from './create-post/create-post.component';

const ProfilePage_Router: Routes = [
    // localhost:4200/main/profile
    {
        path: '', component: ProfilePageComponent,
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: OverviewInfoComponent },
            { path: 'createPost/:id', component: CreatePostComponent },
        ]
    },
]

export const ProfilePageRouter = RouterModule.forChild(ProfilePage_Router);