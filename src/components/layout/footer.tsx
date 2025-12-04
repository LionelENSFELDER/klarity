import { Badge } from "@/components/ui/badge";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>© 2025 Klarity. Tous droits réservés.</span>
            <Badge variant="outline" className="text-xs">
              Alpha v0.1.0
            </Badge>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-700 transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Conditions
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
