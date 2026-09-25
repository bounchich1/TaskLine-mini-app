import { Avatar as MaxAvatar, type AvatarTextGradient } from '@maxhub/max-ui';

const GRADIENTS: readonly AvatarTextGradient[] = ['blue', 'green', 'orange', 'purple', 'red'];

/** Up to two initials: "Анна Смирнова" → "АС". */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

/** The same name always gets the same color, as in MAX chats. */
function gradientFor(name: string): AvatarTextGradient {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 997;
  }
  return GRADIENTS[hash % GRADIENTS.length] ?? 'blue';
}

/** A person's initials on a MAX-style colored circle; decorative next to the visible name. */
export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <MaxAvatar.Container size={size} aria-hidden="true">
      <MaxAvatar.Text gradient={gradientFor(name)}>{initials(name)}</MaxAvatar.Text>
    </MaxAvatar.Container>
  );
}
