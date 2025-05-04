import type { FC } from 'react';
import './skills.css';
import './svg.css';
import './lines.css';
import './button.css';

type Props = {
	className: string;
	fill?: string;
	height?: number;
	name: string;
	width?: number;
};

export const Icon: FC<Readonly<Props>> = ({ className, fill, height, name, width }: Props) => (
	<svg className={className} height={height} width={width}>
		<use fill={fill} xlinkHref={`#${name}`} />
	</svg>
);

export default Icon;
