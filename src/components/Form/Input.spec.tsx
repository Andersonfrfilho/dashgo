import { render } from '@testing-library/react';
import { Input } from './Input';

test('active link renders correctly', () => {
  const { debug } = render(<Input />);

  debug();
});
