import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useBreakpointValue,
} from '@chakra-ui/react';

import { useSidebarDrawer } from '../../contexts/SidebarDrawerContext';
import { SideBarNav } from './SideBarNav';

export function Sidebar() {
  const { isOpen, onClose } = useSidebarDrawer();
  const isFloatingSideBar = useBreakpointValue({
    base: true,
    lg: false,
  });

  if (isFloatingSideBar) {
    return (
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay>
          <DrawerContent backgroundColor="gray.800" padding="4">
            <DrawerCloseButton mt="6" />
            <DrawerHeader>Navegação</DrawerHeader>
            <DrawerBody>
              <SideBarNav />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    );
  }
  return (
    <Box as="aside" width="64" marginRight="8">
      <SideBarNav />
    </Box>
  );
}
