const routeLoaders = {
  '/': () => import('../pages/Home'),
  '/projects': () => import('../pages/Projects'),
  '/projects/:id': () => import('../pages/ProjectDetails'),
  '/create-project': () => import('../pages/CreateProject'),
  '/my-projects': () => import('../pages/MyProjects'),
  '/chat': () => import('../pages/Chat'),
  '/profile': () => import('../pages/Profile'),
  '/login': () => import('../pages/Login'),
  '/register': () => import('../pages/Register'),
  '/admin': () => import('../pages/AdminDashboard'),
};

const preloadedSet = new Set();

export const preloadRoute = (path) => {
  if (!path) return;

  let target = path.split('?')[0].split('#')[0];
  if (target.startsWith('/projects/') && target !== '/projects') {
    target = '/projects/:id';
  } else if (target.startsWith('/profile/') && target !== '/profile') {
    target = '/profile';
  }

  if (preloadedSet.has(target)) return;

  const loader = routeLoaders[target];
  if (loader) {
    preloadedSet.add(target);
    loader().catch(() => {
      preloadedSet.delete(target);
    });
  }
};

/**
 * Prefetch most commonly visited routes when browser is idle
 */
export const preloadCommonRoutes = () => {
  if (typeof window === 'undefined') return;
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));
  idleCallback(() => {
    preloadRoute('/projects');
  });
};
