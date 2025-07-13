import {Avatar} from './catalyst/avatar'
import {
    Dropdown,
    DropdownButton, DropdownDivider, DropdownHeading,
    DropdownItem,
    DropdownLabel,
    DropdownMenu, DropdownSection,
} from './catalyst/dropdown'
import {Navbar, NavbarDivider, NavbarItem, NavbarLabel, NavbarSection, NavbarSpacer} from './catalyst/navbar'
import {Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection} from './catalyst/sidebar'
import {StackedLayout} from './catalyst/stacked-layout'
import {
    ArrowRightStartOnRectangleIcon,
    UserIcon,
} from '@heroicons/react/16/solid'
import {Subheading} from "./catalyst/heading.jsx";
import {Button} from "./catalyst/button.jsx";

import pb from "./lib/pocketbase.js";

const navItems = [
    {label: 'Home', url: '/'},
    {label: 'About', url: '/about'},
]

const App = ({children}) => {
    const login = () => {
        localStorage.setItem('redirect', 'https://gatherbuddy.bfrisco.io');
        window.location.href = 'https://bricefrisco.com/login';
    }

    const logout = () => {
        localStorage.removeItem('pocketbase_auth');
        window.location.reload();
    }

    return (
        <StackedLayout
            navbar={
                <Navbar>
                    <NavbarLabel className="flex items-center ml-2">
                        <Avatar src="/vite.svg" className="mr-2"/>
                        <Subheading>GatherBuddy</Subheading>
                    </NavbarLabel>
                    <NavbarDivider className="max-lg:hidden"/>
                    <NavbarSection className="max-lg:hidden">
                        {navItems.map(({label, url}) => (
                            <NavbarItem key={label} href={url}>
                                {label}
                            </NavbarItem>
                        ))}
                    </NavbarSection>
                    <NavbarSpacer/>
                    <NavbarSection>
                        {pb.authStore.isValid ? (
                            <Dropdown>
                                <DropdownButton as={NavbarItem}>
                                    <UserIcon/>
                                </DropdownButton>
                                <DropdownMenu className="min-w-64" anchor="bottom end">
                                    <DropdownSection>
                                        <DropdownHeading>
                                            {pb.authStore.record.email}
                                        </DropdownHeading>
                                    </DropdownSection>
                                    <DropdownDivider />
                                    <DropdownItem onClick={() => logout()}>
                                        <ArrowRightStartOnRectangleIcon/>
                                        <DropdownLabel>Sign out</DropdownLabel>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        ) : (
                            <Button onClick={() => login()}>Sign in</Button>
                        )}
                    </NavbarSection>
                </Navbar>
            }
            sidebar={
                <Sidebar>
                    <SidebarHeader>
                        <SidebarLabel className="flex items-center mt-1">
                            <Avatar src="/vite.svg" className="mr-2"/>
                            <Subheading>GatherBuddy</Subheading>
                        </SidebarLabel>
                    </SidebarHeader>
                    <SidebarBody>
                        <SidebarSection>
                            {navItems.map(({label, url}) => (
                                <SidebarItem key={label} href={url}>
                                    {label}
                                </SidebarItem>
                            ))}
                        </SidebarSection>
                    </SidebarBody>
                </Sidebar>
            }
        >
            {children}
        </StackedLayout>
    )
}

export default App;