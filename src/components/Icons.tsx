import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
}

export const StarIcon = ({ size = 24, color = "#F59E0B" }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
);

export const CommentIcon = ({ size = 24, color = 'white' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Svg>
);

export const SendIcon = ({ size = 24, color = 'white' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const MoreVerticalIcon = ({ size = 24, color = 'white' }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="1" fill={color} />
        <Circle cx="12" cy="5" r="1" fill={color} />
        <Circle cx="12" cy="19" r="1" fill={color} />
    </Svg>
);

export const LikeIcon = ({ size = 24, color = "white" }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
    </Svg>
);

export const PhoneIcon = ({ size = 24, color = "white" }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.26-.27.36-.66.25-1.01-.37-1.11-.56-2.3-.56-3.53 0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
    </Svg>
);

export const HomeIcon = ({ size = 24, color = "white" }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </Svg>
);

export const UserIcon = ({ size = 24, color = "white" }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </Svg>
);

export const BellIcon = ({ size = 24, color = "white" }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
    </Svg>
);
