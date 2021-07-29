import { Flex, Icon, Input } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { RiSearch2Line } from 'react-icons/ri';

// controller components Declarativa
// é quando eu digo o que eu espero e aquilo acontece de forma automática
// useState

// uncontrollers components
// maneira imperativa diz exatamente o que queremos fazer para o código
export function SearchBox() {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // debounce evitar que a busca seja chama quando a pessoa esteja digitando
  return (
    <Flex
      as="label"
      flex="1"
      paddingY="4"
      paddingX="8"
      marginLeft="6"
      maxWidth="400"
      alignSelf="center"
      color="gray.200"
      position="relative"
      backgroundColor="gray.800"
      borderRadius="full"
    >
      <Input
        color="gray.50"
        variant="unstyled"
        paddingX="4"
        marginRight="4"
        placeholder="Buscar na plataforma"
        _placeholder={{ color: 'gray.400' }}
        value={search}
        onChange={event => setSearch(event.target.value)}
        ref={searchInputRef}
      />
      <Icon as={RiSearch2Line} fontSize="20" />
    </Flex>
  );
}
