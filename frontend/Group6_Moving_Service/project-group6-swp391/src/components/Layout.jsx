import Header from './Header'
import ChatBot from './ChatBot'
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div>
            <Header/>
            <Outlet/>
            <ChatBot/>
        </div>
    );
};

export default Layout;