import { appPath } from './api';

export default function Link({ href, children, ...props }) {
    const target = typeof href === 'string' ? href : href?.pathname || '#';
    return <a href={appPath(target)} {...props}>{children}</a>;
}
