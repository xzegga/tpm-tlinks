import { Button } from '@chakra-ui/react';
import React from 'react';
import { NavLink as Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
    to: string;
    name: string;
    [key: string]: any;
}

const NavLnk: React.FC<NavLinkProps> = ({ to, name, ...rest }) => {
    const location = useLocation()

    const isActive = location.pathname === to

    return (
        <Link to={to}>
            <Button
                variant={isActive ? 'outline' : 'ghost'}
                colorScheme={isActive ? 'blue' : ''}
                {...rest}
            >{name}
            </Button>
        </Link>
    );
};

export default NavLnk;
