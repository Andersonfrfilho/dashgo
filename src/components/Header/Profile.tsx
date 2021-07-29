import { Avatar, Box, Flex, Text } from '@chakra-ui/react';

interface ProfileProps {
  showProfileData?: boolean;
}
export function Profile({ showProfileData = true }: ProfileProps) {
  return (
    <Flex alignItems="center">
      {showProfileData && (
        <Box>
          <Text>Anderson Fernandes</Text>
          <Text color="gray.300" fontSize="small">
            andersonfrfilho@gmail.com
          </Text>
        </Box>
      )}
      <Avatar
        size="md"
        name="Anderson Fernandes"
        src="https://github.com/andersonfrfilho.png"
      />
    </Flex>
  );
}
